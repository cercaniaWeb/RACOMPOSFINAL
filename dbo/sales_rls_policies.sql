-- RLS Policies for the sales table

-- Enable Row Level Security for sales table
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Allow authenticated users to select sales data
-- Users can see sales from their assigned store, admins can see all sales
CREATE POLICY "Allow users to select sales from their store" ON public.sales
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (
            role = 'admin'
            OR store_id = (SELECT storeId FROM users WHERE id = auth.uid())
        )
    )
);

-- Policy for INSERT: Allow users with cashier, manager, or admin roles to insert sales in their store
CREATE POLICY "Allow authorized users to insert sales" ON public.sales
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (
            role IN ('admin', 'gerente', 'cajera')
            AND (store_id = (SELECT storeId FROM users WHERE id = auth.uid()) OR role = 'admin')
        )
    )
);

-- Policy for UPDATE: Only allow admins and managers to update sales (for corrections, returns, etc.)
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

-- Policy for DELETE: Only allow admins to delete sales (should rarely be needed)
CREATE POLICY "Allow only admins to delete from sales" ON public.sales
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);