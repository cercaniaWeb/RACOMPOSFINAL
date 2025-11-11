-- Comprehensive Deployment Script for POS Application
-- Use this script to deploy all schema changes to production Supabase instance

-- 1. Create tables if they don't exist (supabase_schema.sql)
-- Table for products with all required fields including weight-based product support
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2),
    category_id UUID,
    subcategory_id UUID,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    unit VARCHAR(20),
    min_stock_threshold JSONB, -- Para almacenar umbrales por tienda
    description TEXT,
    image_url TEXT,
    brand VARCHAR(255), -- Marca del producto
    supplier_id VARCHAR(100), -- ID del proveedor
    weight DECIMAL(10, 3), -- Peso del producto
    dimensions JSONB, -- Dimensiones {length, width, height}
    tax_rate DECIMAL(5, 2) DEFAULT 0, -- Tasa de impuesto
    is_active BOOLEAN DEFAULT true, -- Si el producto está activo
    notes TEXT, -- Notas adicionales
    tags JSONB, -- Etiquetas del producto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID,
    subcategories JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for users with security fix
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'empleado',
    store_id VARCHAR(50),
    password_hash VARCHAR(255), -- Using password_hash instead of password for security
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for stores
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for inventory batches
CREATE TABLE IF NOT EXISTS inventory_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    location_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 2),
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for sales
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart JSONB NOT NULL, -- Datos del carrito en formato JSON
    subtotal DECIMAL(10, 2) NOT NULL,
    discount JSONB, -- {type: 'percentage'|'amount', value: number}
    note TEXT,
    total DECIMAL(10, 2) NOT NULL,
    cash DECIMAL(10, 2),
    card DECIMAL(10, 2),
    card_commission DECIMAL(10, 2) DEFAULT 0,
    commission_in_cash BOOLEAN DEFAULT false,
    cashier VARCHAR(255),
    store_id VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    credit_balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for transfers
CREATE TABLE IF NOT EXISTS transfers (
    id VARCHAR(50) PRIMARY KEY,
    origin_location_id VARCHAR(50) NOT NULL,
    destination_location_id VARCHAR(50) NOT NULL,
    requested_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'solicitado',
    items JSONB, -- Array de ítems en formato JSON
    history JSONB, -- Historial de estados
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for shopping list
CREATE TABLE IF NOT EXISTS shopping_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pendiente',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    concept VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(100),
    details TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending'
);

-- Table for cash closings
CREATE TABLE IF NOT EXISTS cash_closings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cashier VARCHAR(255) NOT NULL,
    initial_cash DECIMAL(10, 2) DEFAULT 0,
    total_sales_amount DECIMAL(10, 2) DEFAULT 0,
    total_cash_sales DECIMAL(10, 2) DEFAULT 0,
    total_card_sales DECIMAL(10, 2) DEFAULT 0,
    final_cash DECIMAL(10, 2),
    sales JSONB, -- Array de ventas incluidas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for reserved inventory (for transfers)
CREATE TABLE IF NOT EXISTS reserved_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_batch_id UUID NOT NULL REFERENCES inventory_batches(id),
    transfer_id VARCHAR(50) NOT NULL,
    quantity_reserved INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'frozen', -- frozen, shipped, completed, cancelled
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Add new columns to existing tables if they don't exist (migration_script.sql)
DO $$
BEGIN
    -- Add brand column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
        ALTER TABLE products ADD COLUMN brand VARCHAR(255);
    END IF;

    -- Add supplier_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_id') THEN
        ALTER TABLE products ADD COLUMN supplier_id VARCHAR(100);
    END IF;

    -- Add weight column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
        ALTER TABLE products ADD COLUMN weight DECIMAL(10, 3);
    END IF;

    -- Add dimensions column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
        ALTER TABLE products ADD COLUMN dimensions JSONB;
    END IF;

    -- Add tax_rate column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tax_rate') THEN
        ALTER TABLE products ADD COLUMN tax_rate DECIMAL(5, 2) DEFAULT 0;
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'notes') THEN
        ALTER TABLE products ADD COLUMN notes TEXT;
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags JSONB;
    END IF;

    -- Add min_stock_threshold column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock_threshold') THEN
        ALTER TABLE products ADD COLUMN min_stock_threshold JSONB;
    END IF;

    -- Ensure users table doesn't have password column (security fix)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users DROP COLUMN password;
    END IF;

    -- Ensure users table has password_hash column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
END $$;

-- 3. Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory_batches(location_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales(store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- 4. Create atomic inventory functions (atomic_inventory_functions.sql)
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

-- 5. Enable and Configure Row Level Security (RLS) Policies

-- Enable RLS for the tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Products RLS policies
CREATE POLICY "Allow authenticated users to select from products" ON public.products
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow only admins and gerentes to insert into products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'gerente')
    )
);

CREATE POLICY "Allow only admins and gerentes to update products" ON public.products
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'gerente')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'gerente')
    )
);

CREATE POLICY "Allow only admins to delete from products" ON public.products
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Sales RLS policies
CREATE POLICY "Allow users to select sales from their store" ON public.sales
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND (
            role = 'admin'
            OR store_id = (SELECT store_id FROM users WHERE id = auth.uid())
        )
    )
);

CREATE POLICY "Allow authorized users to insert sales" ON public.sales
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND (
            role IN ('admin', 'gerente', 'cajera')
            AND (store_id = (SELECT store_id FROM users WHERE id = auth.uid()) OR role = 'admin')
        )
    )
);

CREATE POLICY "Allow admins and managers to update sales" ON public.sales
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'gerente')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'gerente')
    )
);

CREATE POLICY "Allow only admins to delete from sales" ON public.sales
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);