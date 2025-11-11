-- Migration script to deploy updated schema with new fields to production

-- Ensure products table has all required columns
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

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory_batches(location_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales(store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);