-- Tabla para productos
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para categorías
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID,
    subcategories JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'empleado',
    store_id VARCHAR(50),
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para tiendas
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para lotes de inventario
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

-- Tabla para ventas
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

-- Tabla para clientes
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

-- Tabla para transferencias
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

-- Tabla para lista de compras
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

-- Tabla para gastos
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

-- Tabla para cierres de caja
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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory_batches(location_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales(store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_storeId_date ON sales(storeId, date);  -- Index for camelCase column
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);