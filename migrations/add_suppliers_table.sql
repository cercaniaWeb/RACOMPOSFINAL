-- Table for suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index on the name for faster searching
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Alter the products table to use a foreign key for supplier_id
-- This assumes that the existing supplier_id values can be migrated to the new suppliers table.
-- For now, I will comment this out to avoid breaking existing data.
-- ALTER TABLE products
-- ADD CONSTRAINT fk_supplier
-- FOREIGN KEY (supplier_id)
-- REFERENCES suppliers(id);
