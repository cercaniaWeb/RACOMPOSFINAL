-- Atomic function to update inventory batches with validation against reserved inventory
-- This function ensures that inventory updates don't affect frozen quantities for transfers

CREATE OR REPLACE FUNCTION atomic_update_inventory_batches_with_audit(
    updates JSONB
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    updated_ids UUID[],
    errors JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    update_record RECORD;
    current_batch RECORD;
    reserved_qty INTEGER;
    available_qty INTEGER;
    new_quantity INTEGER;
    updated_batch_ids UUID[] := '{}';
    error_list JSONB := '[]'::JSONB;
    error_count INTEGER := 0;
BEGIN
    -- Loop through each update in the JSONB array
    FOR update_record IN 
        SELECT 
            (value->>'inventory_id')::UUID as inventory_id,
            (value->>'new_quantity')::INTEGER as new_quantity
        FROM jsonb_array_elements(updates)
    LOOP
        -- Get current batch information
        SELECT * INTO current_batch 
        FROM inventory_batches 
        WHERE id = update_record.inventory_id
        FOR UPDATE;
        
        -- Check if batch exists
        IF NOT FOUND THEN
            error_list := error_list || jsonb_build_object(
                'inventory_id', update_record.inventory_id,
                'error', 'Inventory batch not found'
            );
            error_count := error_count + 1;
            CONTINUE;
        END IF;
        
        -- Calculate reserved quantity for this batch (for any active transfers)
        SELECT COALESCE(SUM(quantity_reserved), 0) INTO reserved_qty
        FROM reserved_inventory
        WHERE inventory_batch_id = update_record.inventory_id
          AND status IN ('frozen', 'shipped');
        
        -- Calculate available quantity (what can be modified)
        available_qty := current_batch.quantity - reserved_qty;
        new_quantity := update_record.new_quantity;
        
        -- Check if the new quantity would affect frozen inventory
        -- The new quantity must be >= reserved quantity
        IF new_quantity < reserved_qty THEN
            error_list := error_list || jsonb_build_object(
                'inventory_id', update_record.inventory_id,
                'error', 'New quantity would affect frozen inventory for transfers',
                'available_qty', available_qty,
                'reserved_qty', reserved_qty,
                'requested_new_qty', new_quantity
            );
            error_count := error_count + 1;
            CONTINUE;
        END IF;
        
        -- Perform the update
        UPDATE inventory_batches 
        SET 
            quantity = new_quantity,
            updated_at = NOW()
        WHERE id = update_record.inventory_id;
        
        -- Add to updated list
        updated_batch_ids := array_append(updated_batch_ids, update_record.inventory_id);
    END LOOP;
    
    -- Return results
    IF error_count > 0 THEN
        RETURN QUERY SELECT 
            FALSE as success,
            error_count || ' errors occurred during inventory update' as message,
            updated_batch_ids,
            error_list as errors;
    ELSE
        RETURN QUERY SELECT 
            TRUE as success,
            'Inventory batches updated successfully' as message,
            updated_batch_ids,
            '[]'::JSONB as errors;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            SQLERRM as message,
            '{}'::UUID[] as updated_ids,
            jsonb_build_object('error', SQLERRM)::JSONB as errors;
END;
$$;

-- Function to get available inventory (total - reserved) for a product at a location
CREATE OR REPLACE FUNCTION get_available_inventory(
    p_product_id UUID,
    p_location_id VARCHAR
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    total_inventory INTEGER;
    reserved_inventory INTEGER;
    available_inventory INTEGER;
BEGIN
    -- Get total inventory for the product at the location
    SELECT COALESCE(SUM(quantity), 0) INTO total_inventory
    FROM inventory_batches
    WHERE product_id = p_product_id
      AND location_id = p_location_id;
    
    -- Get reserved inventory for the product at the location
    SELECT COALESCE(SUM(ri.quantity_reserved), 0) INTO reserved_inventory
    FROM inventory_batches ib
    JOIN reserved_inventory ri ON ib.id = ri.inventory_batch_id
    WHERE ib.product_id = p_product_id
      AND ib.location_id = p_location_id
      AND ri.status IN ('frozen', 'shipped');
    
    -- Calculate available inventory
    available_inventory := total_inventory - reserved_inventory;
    
    RETURN GREATEST(available_inventory, 0); -- Ensure non-negative result
END;
$$;

-- Function to validate inventory availability for a transfer request
CREATE OR REPLACE FUNCTION validate_transfer_availability(
    p_items JSONB,
    p_origin_location_id VARCHAR
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    unavailable_items JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    item RECORD;
    available_qty INTEGER;
    requested_qty INTEGER;
    unavailable_list JSONB := '[]'::JSONB;
BEGIN
    FOR item IN 
        SELECT 
            (value->>'productId')::UUID as product_id,
            (value->>'quantity')::INTEGER as quantity
        FROM jsonb_array_elements(p_items)
    LOOP
        requested_qty := item.quantity;
        available_qty := get_available_inventory(item.product_id, p_origin_location_id);
        
        IF available_qty < requested_qty THEN
            unavailable_list := unavailable_list || jsonb_build_object(
                'product_id', item.product_id,
                'requested', requested_qty,
                'available', available_qty,
                'shortage', requested_qty - available_qty
            );
        END IF;
    END LOOP;
    
    IF jsonb_array_length(unavailable_list) > 0 THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Insufficient available inventory for transfer' as message,
            unavailable_list as unavailable_items;
    ELSE
        RETURN QUERY SELECT 
            TRUE as success,
            'All items have sufficient available inventory' as message,
            '[]'::JSONB as unavailable_items;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            SQLERRM as message,
            '[]'::JSONB as unavailable_items;
END;
$$;