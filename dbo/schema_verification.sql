-- Schema verification script
-- Run this script to verify that all required columns are present in the database

-- Verify products table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check for specific columns we need
SELECT 
    'brand' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'supplier_id' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_id') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'weight' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'dimensions' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'tax_rate' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tax_rate') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'is_active' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'notes' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'notes') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'tags' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'min_stock_threshold' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock_threshold') THEN 'EXISTS' ELSE 'MISSING' END AS status;

-- Verify users table for security fix (should NOT have password column)
SELECT 
    'password' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN 'EXISTS - SECURITY RISK!' ELSE 'NOT EXISTS - OK' END AS status
UNION ALL
SELECT 
    'password_hash' AS column_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN 'EXISTS' ELSE 'MISSING' END AS status;