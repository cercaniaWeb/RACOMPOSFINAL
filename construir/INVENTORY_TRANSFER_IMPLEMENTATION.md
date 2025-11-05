# Inventory Transfer Management System Implementation

## Overview

This document outlines the implementation of the enhanced inventory management system for transfers that addresses the following requirements:

1. When a transfer is approved, inventory is "frozen" or reserved at the origin location (reducing available quantity but not completely removing from stock)
2. When a transfer is shipped, the frozen inventory moves from the origin to the destination location
3. When a transfer is received, inventory is properly allocated to the destination location
4. When items are not fully received, they are returned to the origin location
5. All operations are handled through atomic database functions to ensure data consistency

## Database Schema Changes

### New Table: `reserved_inventory`

```sql
CREATE TABLE IF NOT EXISTS reserved_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_batch_id UUID NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
    transfer_id VARCHAR NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    quantity_reserved INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'frozen' CHECK (status IN ('frozen', 'shipped', 'returned', 'partially_returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(inventory_batch_id, transfer_id)
);
```

This table tracks inventory that has been reserved for transfers but not yet shipped.

### Updated `transfers` Table

The `transfers` table has been enhanced with additional fields:

- `origin_location_type` - Type of origin location ('bodega' or 'tienda')
- `destination_location_type` - Type of destination location ('bodega' or 'tienda')
- `approval_date` - When the transfer was approved
- `shipping_date` - When the transfer was shipped
- `receiving_date` - When the transfer was received
- `received_items` - Track what was received vs requested
- `notes` - Additional notes about the transfer
- `total_amount` - For valuation tracking

## Database Functions

### 1. `atomic_approve_transfer_with_inventory_freeze`

This function handles the approval of transfers and freezes the required inventory at the origin location:

- Validates that sufficient available inventory exists (excluding already frozen inventory)
- Creates reservation records in the `reserved_inventory` table
- Updates the transfer status to 'aprobado'
- Uses FIFO (First In, First Out) logic based on expiration dates

### 2. `atomic_ship_transfer_with_inventory`

This function handles the shipping of transfers:

- Moves frozen inventory from origin to destination
- Updates the origin inventory batches (reducing quantity)
- Creates or updates inventory batches at the destination
- Updates reservation records to 'shipped' status
- Updates transfer status to 'enviado'

### 3. `atomic_receive_transfer_with_inventory`

This function handles the receipt of transfers:

- Processes received items and updates destination inventory
- Handles partial receipts by returning un-received items to origin
- Updates reservation records based on actual receipt
- Updates transfer status to 'recibido' or 'parcialmente_recibido'

### 4. `atomic_cancel_transfer_with_inventory`

This function handles cancellation of transfers:

- Returns frozen inventory to available state
- Updates reservation records to reflect cancellation
- Updates transfer status to 'cancelado'

### 5. `atomic_update_inventory_batches_with_audit`

This function provides atomic updates to inventory while respecting frozen quantities:

- Validates that updates don't affect frozen inventory
- Ensures quantity changes respect reserved amounts
- Provides audit trail functionality

### 6. `get_available_inventory`

This function returns the available inventory (total - reserved) for a product at a location.

### 7. `validate_transfer_availability`

This function validates that sufficient available inventory exists for a transfer request.

## Frontend Integration

### Updated Store Functions

The following functions in `useAppStore.js` have been updated to use the new atomic database functions:

- `approveTransfer()` - Now calls `atomic_approve_transfer_with_inventory_freeze`
- `shipTransfer()` - Now calls `atomic_ship_transfer_with_inventory`
- `receiveTransfer()` - Now calls `atomic_receive_transfer_with_inventory`
- `cancelTransfer()` - New function that calls `atomic_cancel_transfer_with_inventory`

### New Function: `cancelTransfer()`

A new function has been added to handle transfer cancellations and return frozen inventory.

## Transfer Workflow Process

### 1. Transfer Creation
- User creates a transfer request
- Status: 'solicitado'
- No inventory is affected at this stage

### 2. Transfer Approval
- User approves the transfer
- System calls `atomic_approve_transfer_with_inventory_freeze`
- Inventory is "frozen" - reserved for this transfer but still counted in total inventory
- Status: 'aprobado'

### 3. Transfer Shipping
- User ships the transfer
- System calls `atomic_ship_transfer_with_inventory`
- Frozen inventory is moved from origin to destination
- Status: 'enviado'

### 4. Transfer Receipt
- User receives the transfer
- System calls `atomic_receive_transfer_with_inventory`
- If all items received: Status becomes 'recibido'
- If partial receipt: Status becomes 'parcialmente_recibido'
- Unreceived items are returned to origin

### 5. Transfer Cancellation (Optional)
- User cancels the transfer
- System calls `atomic_cancel_transfer_with_inventory`
- Frozen inventory is returned to available state
- Status: 'cancelado'

## Key Features

### Inventory Reservation
- When a transfer is approved, inventory is reserved but not removed from available stock
- Other operations can't use reserved inventory
- Available inventory calculation excludes reserved quantities

### FIFO Logic
- When reserving or shipping inventory, FIFO (First In, First Out) logic is used based on expiration dates
- This ensures proper inventory rotation

### Partial Receipt Handling
- Supports receiving only part of a transfer
- Unreceived items are automatically returned to the origin location
- Properly handles inventory accounting for both received and returned items

### Atomic Operations
- All operations are atomic database transactions
- Ensures data consistency even if operations fail partway through
- Prevents inventory discrepancies

### Error Handling
- Comprehensive error handling with meaningful error messages
- Validation at each step to prevent invalid operations
- Rollback mechanisms for failed operations

## Data Consistency

### Reserved Inventory Tracking
- Tracks which inventory is reserved for which transfers
- Prevents double-counting of inventory
- Maintains accurate available inventory calculations

### Audit Trail
- All operations maintain proper timestamps
- Status history is tracked for each transfer
- Changes to inventory are properly timestamped

## Implementation Files

1. `transfer_inventory_management.sql` - Core transfer functions
2. `atomic_inventory_functions.sql` - Atomic inventory update functions
3. `updated_schema.sql` - Updated database schema
4. `src/store/useAppStore.js` - Updated frontend store with new logic

## Testing Considerations

### Unit Tests
- Test each atomic function individually
- Verify inventory calculations are correct
- Test edge cases like partial receipts and cancellations

### Integration Tests
- Test the complete transfer workflow
- Verify inventory consistency throughout the process
- Test concurrent operations to ensure no conflicts

### Error Condition Tests
- Test with insufficient inventory
- Test with invalid transfer states
- Test with network failures and offline scenarios