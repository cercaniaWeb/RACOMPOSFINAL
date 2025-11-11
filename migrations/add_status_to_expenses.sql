-- Migration para añadir campo de estado a la tabla de gastos

-- Añadir la columna status a la tabla de gastos
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Actualizar los registros existentes para que tengan un estado por defecto
-- Puedes cambiar este valor si quieres que los gastos existentes se marquen como aprobados
UPDATE expenses 
SET status = 'approved' 
WHERE status IS NULL;