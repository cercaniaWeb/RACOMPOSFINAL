-- Migration to add updated_at column to expenses table

-- Add the updated_at column to the expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Optional: Update existing records to have updated_at value
UPDATE expenses 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Optional: Add a trigger to automatically update the updated_at column
-- This uses a function that updates the updated_at field before any update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger that calls the function before any update on the expenses table
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();