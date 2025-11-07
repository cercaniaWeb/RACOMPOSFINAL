-- RLS Policies for the products table

-- Enable Row Level Security for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Allow authenticated users to select products data
-- This allows all logged-in users to view products (necessary for POS functionality)
CREATE POLICY "Allow authenticated users to select from products" ON public.products
FOR SELECT TO authenticated
USING (true);

-- Policy for INSERT: Only allow users with admin or gerente role to insert new products
CREATE POLICY "Allow only admins and gerentes to insert into products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'gerente')
    )
);

-- Policy for UPDATE: Only allow users with admin or gerente role to update products
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

-- Policy for DELETE: Only allow users with admin role to delete products
CREATE POLICY "Allow only admins to delete from products" ON public.products
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);