# Reporte de la Base de Datos: CONFIBDO

A continuación se detallan las tablas, sus campos y las relaciones que existen entre ellas.

---

### **Tabla: `products`**
Almacena la información de los productos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del producto (Clave Primaria). |
| `name` | `VARCHAR(255)` | Nombre del producto. |
| `price` | `DECIMAL(10, 2)` | Precio de venta. |
| `cost` | `DECIMAL(10, 2)` | Costo de adquisición. |
| `category_id` | `UUID` | **Relacionado con `categories.id`**. |
| `subcategory_id` | `UUID` | **Relacionado con `categories.id`** (para subcategorías). |
| `sku` | `VARCHAR(100)` | Código de referencia (SKU). |
| `barcode` | `VARCHAR(100)` | Código de barras. |
| `unit` | `VARCHAR(20)` | Unidad de medida (ej. "kg", "pieza"). |
| `min_stock_threshold` | `JSONB` | Umbrales de stock mínimo por tienda. |
| `description` | `TEXT` | Descripción del producto. |
| `image_url` | `TEXT` | URL de la imagen del producto. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `categories`**
Almacena las categorías y subcategorías de los productos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único de la categoría (Clave Primaria). |
| `name` | `VARCHAR(255)` | Nombre de la categoría. |
| `parent_id` | `UUID` | **Auto-referencia a `categories.id`** para anidar subcategorías. |
| `subcategories` | `JSONB` | JSON con información de las subcategorías. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `users`**
Almacena la información de los usuarios del sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del usuario (Clave Primaria). |
| `email` | `VARCHAR(255)` | Correo electrónico (único). |
| `name` | `VARCHAR(255)` | Nombre del usuario. |
| `role` | `VARCHAR(50)` | Rol del usuario (ej. "empleado", "admin"). |
| `store_id` | `VARCHAR(50)` | **Relacionado con `stores.id`**. Tienda asignada al usuario. |
| `password_hash` | `VARCHAR(255)` | Hash de la contraseña. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `stores`**
Almacena la información de las tiendas o sucursales.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | Identificador único de la tienda (Clave Primaria). |
| `name` | `VARCHAR(255)` | Nombre de la tienda. |
| `address` | `TEXT` | Dirección de la tienda. |
| `phone` | `VARCHAR(20)` | Teléfono de la tienda. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `inventory_batches`**
Gestiona el stock de productos en lotes por ubicación.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del lote (Clave Primaria). |
| `product_id` | `UUID` | **Relacionado con `products.id`**. |
| `location_id` | `VARCHAR(50)` | **Relacionado con `stores.id`**. Ubicación del stock (tienda o bodega). |
| `quantity` | `INTEGER` | Cantidad de producto en el lote. |
| `cost` | `DECIMAL(10, 2)` | Costo del lote. |
| `expiration_date` | `DATE` | Fecha de caducidad del lote. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `sales`**
Registra todas las transacciones de venta.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único de la venta (Clave Primaria). |
| `cart` | `JSONB` | Contenido del carrito de compra. |
| `subtotal` | `DECIMAL(10, 2)` | Subtotal de la venta. |
| `discount` | `JSONB` | Información del descuento aplicado. |
| `note` | `TEXT` | Notas adicionales sobre la venta. |
| `total` | `DECIMAL(10, 2)` | Total de la venta. |
| `cash` | `DECIMAL(10, 2)` | Monto pagado en efectivo. |
| `card` | `DECIMAL(10, 2)` | Monto pagado con tarjeta. |
| `card_commission`| `DECIMAL(10, 2)` | Comisión por pago con tarjeta. |
| `commission_in_cash` | `BOOLEAN` | Indica si la comisión se cobró en efectivo. |
| `cashier` | `VARCHAR(255)` | Nombre del cajero. |
| `store_id` | `VARCHAR(50)` | **Relacionado con `stores.id`**. |
| `date` | `TIMESTAMP` | Fecha de la venta. |
| `created_at` | `TIMESTAMP` | Fecha de creación del registro. |

---

### **Tabla: `clients`**
Almacena la información de los clientes.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del cliente (Clave Primaria). |
| `name` | `VARCHAR(255)` | Nombre del cliente. |
| `email` | `VARCHAR(255)` | Correo electrónico. |
| `phone` | `VARCHAR(20)` | Teléfono. |
| `address` | `TEXT` | Dirección. |
| `credit_balance` | `DECIMAL(10, 2)` | Saldo de crédito del cliente. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `transfers`**
Gestiona las transferencias de inventario entre ubicaciones.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | Identificador único de la transferencia (Clave Primaria). |
| `origin_location_id` | `VARCHAR(50)` | **Relacionado con `stores.id`**. Ubicación de origen. |
| `destination_location_id` | `VARCHAR(50)` | **Relacionado con `stores.id`**. Ubicación de destino. |
| `requested_by` | `UUID` | **Relacionado con `users.id`**. Usuario que solicitó la transferencia. |
| `status` | `VARCHAR(50)` | Estado de la transferencia (ej. "solicitado", "enviado"). |
| `items` | `JSONB` | Productos y cantidades transferidas. |
| `history` | `JSONB` | Historial de cambios de estado. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `shopping_list`**
Utilizada para crear listas de compras pendientes.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único (Clave Primaria). |
| `product_id` | `UUID` | **Relacionado con `products.id`**. |
| `quantity` | `INTEGER` | Cantidad a comprar. |
| `notes` | `TEXT` | Notas adicionales. |
| `status` | `VARCHAR(50)` | Estado (ej. "pendiente", "comprado"). |
| `created_by` | `UUID` | **Relacionado con `users.id`**. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización. |

---

### **Tabla: `expenses`**
Registra los gastos operativos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del gasto (Clave Primaria). |
| `date` | `DATE` | Fecha del gasto. |
| `concept` | `VARCHAR(255)` | Concepto del gasto. |
| `amount` | `DECIMAL(10, 2)` | Monto del gasto. |
| `type` | `VARCHAR(100)` | Tipo de gasto. |
| `details` | `TEXT` | Detalles adicionales. |
| `created_by` | `UUID` | **Relacionado con `users.id`**. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |

---

### **Tabla: `cash_closings`**
Registra los cierres de caja.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del cierre (Clave Primaria). |
| `date` | `TIMESTAMP` | Fecha del cierre. |
| `cashier` | `VARCHAR(255)` | Nombre del cajero. |
| `initial_cash` | `DECIMAL(10, 2)` | Efectivo inicial. |
| `total_sales_amount` | `DECIMAL(10, 2)` | Monto total de ventas. |
| `total_cash_sales` | `DECIMAL(10, 2)` | Ventas totales en efectivo. |
| `total_card_sales` | `DECIMAL(10, 2)` | Ventas totales con tarjeta. |
| `final_cash` | `DECIMAL(10, 2)` | Efectivo final al cierre. |
| `sales` | `JSONB` | Ventas incluidas en el cierre. |
| `created_at` | `TIMESTAMP` | Fecha de creación. |

### **Índices**
Se han creado varios índices (`CREATE INDEX`) en tablas como `products`, `inventory_batches`, `sales`, `transfers` y `expenses` para optimizar las consultas y mejorar el rendimiento general de la base de datos.
