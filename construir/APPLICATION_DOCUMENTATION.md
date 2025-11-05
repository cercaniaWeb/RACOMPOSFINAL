# RECOOM POS - Documentación Completa de la Aplicación

## 📋 Tabla de Contenidos

1. [Modelo de Negocio](#modelo-de-negocio)
2. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
3. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
4. [Esquema de la Base de Datos](#esquema-de-la-base-de-datos)
5. [Arquitectura Offline-First](#arquitectura-offline-first)
6. [Sistema de Seguridad y Roles](#sistema-de-seguridad-y-roles)
7. [Flujos de Negocio](#flujos-de-negocio)
8. [Configuración y Despliegue](#configuración-y-despliegue)

## Modelo de Negocio

### Descripción General
RECOOM POS es una aplicación especializada en la gestión de abarrotes multi-sucursal con un modelo de inventario distribuido. La aplicación está diseñada para operar en entornos con conectividad variable, incluyendo capacidades PWA (Progressive Web App) para funcionar completamente sin conexión.

### Estructura de Sucursales
El sistema opera con un modelo de inventario distribuido que incluye:
- **Bodega Central**: Almacén principal de productos
- **Tienda 1**: Sucursal primaria
- **Tienda 2**: Sucursal secundaria

Esta estructura permite una gestión eficiente del inventario a través de múltiples ubicaciones, con capacidad de traslados entre sucursales y control detallado de stock por ubicación.

### Características del Modelo de Negocio
- Gestión de inventario distribuido por ubicación
- Control de stock en tiempo real
- Sistema de traslados entre bodega y tiendas
- Funcionalidad offline-first con sincronización automática
- Gestión de roles (Cajera, Gerente, Administrador)
- Reportes analíticos por tienda
- Soporte para productos vendidos por peso

## Arquitectura de la Aplicación

### Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| **Frontend** | React (SPA) con Vite |
| **Estilo** | Tailwind CSS |
| **Estado Global** | Zustand |
| **Base de Datos** | Supabase |
| **Almacenamiento Offline** | IndexedDB |
| **Despliegue** | PWA (Progressive Web App) |

### Estructura del Proyecto

```
src/
├── api/               # Lógica de llamadas a la API
├── components/        # Componentes reutilizables de UI
├── config/            # Configuración de servicios (Supabase, etc.)
├── context/           # Contextos de React
├── entities/          # Definiciones de entidades
├── estilos/           # Estilos personalizados
├── features/          # Módulos específicos de funcionalidad
│   ├── alerts/        # Sistema de alertas
│   ├── auth/          # Autenticación
│   ├── clients/       # Gestión de clientes
│   ├── inventory/     # Gestión de inventario
│   ├── pos/           # Punto de venta
│   ├── products/      # Gestión de productos
│   ├── purchases/     # Compras
│   ├── reports/       # Reportes y análisis
│   ├── settings/      # Configuraciones
│   ├── transfers/     # Traslados entre sucursales
│   ├── users/         # Gestión de usuarios
│   └── weightProducts/ # Productos por peso
├── hooks/             # Hooks personalizados de React
├── layouts/           # Layouts de la aplicación
├── pages/             # Páginas principales de la aplicación
├── services/          # Servicios y utilidades
├── store/             # Gestión de estado global (Zustand)
├── styles/            # Archivos de estilos
├── test/              # Pruebas
├── types/             # Definiciones de tipos TypeScript
└── utils/             # Utilidades y funciones auxiliares
```

## Módulos y Funcionalidades

### 1. Módulo de Autenticación (`/features/auth`)
- Gestión de inicio de sesión y registro
- Control de roles de usuario
- Protección de rutas por permisos
- Cierre de sesión seguro

### 2. Punto de Venta (`/features/pos`)
- Interfaz de venta rápida
- Búsqueda y escaneo de productos
- Gestión de carrito de compras
- Aplicación de descuentos
- Procesamiento de pagos (efectivo, tarjeta)
- Notas en ventas
- Impresión de tickets
- Funcionalidad offline completa

#### Características del POS:
- Búsqueda rápida de productos por nombre o código de barras
- Escaneo de códigos de barras mediante cámara móvil
- Soporte para productos vendidos por peso
- Aplicación de descuentos por porcentaje o monto fijo
- Gestión de pagos en efectivo y tarjeta
- Impresión automática de tickets
- Integración con sistema de inventario en tiempo real

### 3. Gestión de Inventario (`/features/inventory`)
- Control de stock por ubicación (bodega, tiendas)
- Gestión de lotes con fechas de vencimiento
- Alertas de stock bajo
- Visualización de productos por proximidad a vencimiento
- Historial de movimientos de inventario
- Funcionalidad offline-first

#### Características del Inventario:
- Control por ubicación física
- Seguimiento de lotes con fechas de vencimiento
- Umbral configurable de stock mínimo
- Alertas de productos próximos a vencer
- Historial completo de movimientos

### 4. Gestión de Productos (`/features/products`)
- CRUD de productos
- Categorización y subcategorización
- Gestión de SKU y códigos de barras
- Manejo de precios y costos
- Imágenes de productos
- Productos vendidos por peso
- Unidades de medida personalizadas

#### Características de Productos:
- Soporte para productos vendidos por unidad, peso o medida
- Categorías y subcategorías jerárquicas
- Asociación con imágenes
- Control de precios y costos
- Gestión de códigos de barras
- Unidades de medida configurables (kg, gr, unidad, etc.)

### 5. Gestión de Usuarios (`/features/users`)
- CRUD de usuarios
- Asignación de roles (Cajera, Gerente, Administrador)
- Asociación a tiendas específicas
- Gestión de permisos por rol

#### Roles de Usuario:
- **Cajera**: Acceso al POS de su tienda asignada, procesamiento de ventas
- **Gerente**: Acceso a inventario, traslados y reportes de su tienda
- **Administrador**: Acceso completo al sistema, configuración general

### 6. Traslados entre Sucursales (`/features/transfers`)
- Solicitud de traslados entre bodega y tiendas
- Aprobación de traslados
- Confirmación de envío y recepción
- Seguimiento del estado del traslado
- Control de inventario durante el proceso

#### Flujo de Traslados:
1. Solicitud de traslado desde origen
2. Validación de disponibilidad de inventario
3. Reserva de inventario (no se puede vender durante traslado)
4. Aprobación del traslado
5. Confirmación de envío
6. Recepción y confirmación en destino
7. Actualización de inventario destino y liberación de reserva

### 7. Gestión de Clientes (`/features/clients`)
- CRUD de clientes
- Historial de compras
- Gestión de crédito (en desarrollo)
- Información de contacto

### 8. Reportes y Análisis (`/features/reports`)
- Reportes de ventas por tienda
- Análisis de utilidad
- Movimientos de inventario
- Cierres de caja
- Análisis de productos más vendidos

### 9. Gestión de Configuración (`/features/settings`)
- Configuración general del sistema
- Gestión de tiendas
- Configuración de impuestos
- Configuración de comisiones de tarjeta
- Parámetros de negocio

### 10. Sistema de Alertas (`/features/alerts`)
- Alertas de stock bajo
- Alertas de productos próximos a vencer
- Alertas personalizadas

### 11. Gestión de Gastos (`/features/purchases`)
- Registro de gastos operativos
- Categorización de gastos
- Seguimiento de flujos de efectivo

### 12. Productos por Peso (`/features/weightProducts`)
- Especialización para productos vendidos por peso
- Integración con balanzas (en desarrollo)
- Precios por unidad de medida (kg, gr, etc.)
- Interfaz optimizada para selección de peso

## Esquema de la Base de Datos

### Tabla `products` - Productos
- `id`: UUID, clave primaria
- `name`: VARCHAR(255), nombre del producto
- `price`: DECIMAL(10, 2), precio de venta
- `cost`: DECIMAL(10, 2), costo del producto
- `category_id`: UUID, referencia a la categoría
- `subcategory_id`: UUID, referencia a la subcategoría
- `sku`: VARCHAR(100), código SKU
- `barcode`: VARCHAR(100), código de barras
- `unit`: VARCHAR(20), unidad de medida (kg, gr, unidad, etc.)
- `min_stock_threshold`: JSONB, umbrales mínimos por tienda
- `description`: TEXT, descripción del producto
- `image_url`: TEXT, URL de la imagen del producto
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `categories` - Categorías
- `id`: UUID, clave primaria
- `name`: VARCHAR(255), nombre de la categoría
- `parent_id`: UUID, referencia a la categoría padre (para subcategorías)
- `subcategories`: JSONB, lista de subcategorías
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `users` - Usuarios
- `id`: UUID, clave primaria
- `email`: VARCHAR(255), email único del usuario
- `name`: VARCHAR(255), nombre del usuario
- `role`: VARCHAR(50), rol del usuario (empleado, gerente, administrador)
- `store_id`: VARCHAR(50), tienda asignada al usuario
- `password_hash`: VARCHAR(255), hash de la contraseña
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `stores` - Tiendas
- `id`: VARCHAR(50), clave primaria
- `name`: VARCHAR(255), nombre de la tienda
- `address`: TEXT, dirección de la tienda
- `phone`: VARCHAR(20), teléfono de la tienda
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `inventory_batches` - Lotes de Inventario
- `id`: UUID, clave primaria
- `product_id`: UUID, referencia al producto
- `location_id`: VARCHAR(50), identificador de la ubicación
- `quantity`: INTEGER, cantidad disponible
- `cost`: DECIMAL(10, 2), costo unitario
- `expiration_date`: DATE, fecha de vencimiento
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `sales` - Ventas
- `id`: UUID, clave primaria
- `cart`: JSONB, datos del carrito en formato JSON
- `subtotal`: DECIMAL(10, 2), subtotal antes de descuentos
- `discount`: JSONB, información del descuento {type: 'percentage'|'amount', value: number}
- `note`: TEXT, nota adicional en la venta
- `total`: DECIMAL(10, 2), total de la venta
- `cash`: DECIMAL(10, 2), monto pagado en efectivo
- `card`: DECIMAL(10, 2), monto pagado con tarjeta
- `card_commission`: DECIMAL(10, 2), comisión de tarjeta
- `commission_in_cash`: BOOLEAN, si la comisión se paga en efectivo
- `cashier`: VARCHAR(255), nombre del cajero
- `store_id`: VARCHAR(50), tienda donde se realizó la venta
- `date`: TIMESTAMP, fecha de la venta
- `created_at`: TIMESTAMP, fecha de creación

### Tabla `clients` - Clientes
- `id`: UUID, clave primaria
- `name`: VARCHAR(255), nombre del cliente
- `email`: VARCHAR(255), email del cliente
- `phone`: VARCHAR(20), teléfono del cliente
- `address`: TEXT, dirección del cliente
- `credit_balance`: DECIMAL(10, 2), saldo de crédito
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `transfers` - Transferencias
- `id`: VARCHAR(50), clave primaria
- `origin_location_id`: VARCHAR(50), ID de la ubicación de origen
- `origin_location_type`: VARCHAR(20), tipo de origen ('bodega' o 'tienda')
- `destination_location_id`: VARCHAR(50), ID de la ubicación de destino
- `destination_location_type`: VARCHAR(20), tipo de destino ('bodega' o 'tienda')
- `requested_by`: UUID, referencia al usuario que solicitó
- `created_at`: TIMESTAMP, fecha de creación
- `approval_date`: TIMESTAMP, fecha de aprobación
- `shipping_date`: TIMESTAMP, fecha de envío
- `receiving_date`: TIMESTAMP, fecha de recepción
- `status`: VARCHAR(50), estado del traslado
- `items`: JSONB, array de ítems en formato JSON
- `received_items`: JSONB, seguimiento de lo recibido vs lo solicitado
- `notes`: TEXT, notas adicionales
- `total_amount`: DECIMAL(10, 2), valor total para seguimiento
- `history`: JSONB, historial de estados
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `reserved_inventory` - Inventario Reservado
- `id`: UUID, clave primaria
- `inventory_batch_id`: UUID, referencia al lote de inventario
- `transfer_id`: VARCHAR, referencia al ID de transferencia
- `quantity_reserved`: INTEGER, cantidad reservada
- `status`: VARCHAR(20), estado de la reserva ('frozen', 'shipped', 'returned', 'partially_returned')
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización
- `UNIQUE(inventory_batch_id, transfer_id)`

### Tabla `shopping_list` - Lista de Compras
- `id`: UUID, clave primaria
- `product_id`: UUID, referencia al producto
- `quantity`: INTEGER, cantidad solicitada
- `notes`: TEXT, notas adicionales
- `status`: VARCHAR(50), estado ('pendiente', etc.)
- `created_by`: UUID, referencia al usuario creador
- `created_at`: TIMESTAMP, fecha de creación
- `updated_at`: TIMESTAMP, fecha de última actualización

### Tabla `expenses` - Gastos
- `id`: UUID, clave primaria
- `date`: DATE, fecha del gasto
- `concept`: VARCHAR(255), concepto del gasto
- `amount`: DECIMAL(10, 2), monto del gasto
- `type`: VARCHAR(100), tipo de gasto
- `details`: TEXT, detalles adicionales
- `created_by`: UUID, referencia al usuario creador
- `created_at`: TIMESTAMP, fecha de creación

### Tabla `cash_closings` - Cierres de Caja
- `id`: UUID, clave primaria
- `date`: TIMESTAMP, fecha del cierre
- `cashier`: VARCHAR(255), nombre del cajero
- `initial_cash`: DECIMAL(10, 2), efectivo inicial
- `total_sales_amount`: DECIMAL(10, 2), total de ventas
- `total_cash_sales`: DECIMAL(10, 2), ventas en efectivo
- `total_card_sales`: DECIMAL(10, 2), ventas con tarjeta
- `final_cash`: DECIMAL(10, 2), efectivo final
- `sales`: JSONB, array de ventas incluidas
- `created_at`: TIMESTAMP, fecha de creación

## Arquitectura Offline-First

### Concepto General
La aplicación implementa una arquitectura offline-first que permite operaciones completas sin conexión a Internet. Todos los datos críticos se almacenan localmente en IndexedDB y se sincronizan cuando se restablece la conexión.

### Datos Almacenados Localmente
- Catálogo de productos
- Categorías y subcategorías
- Información de usuarios y tiendas
- Lotes de inventario
- Historial de ventas (últimas 100)
- Clientes y proveedores
- Configuración de la aplicación

### Operaciones Disponibles sin Conexión
- Búsqueda y selección de productos
- Procesamiento completo de ventas
- Gestión de carrito
- Aplicación de descuentos
- Registro de notas en ventas
- Escaneo de códigos de barras
- Impresión de tickets
- Consulta de inventario disponible

### Sincronización Automática
Cuando se recupera la conexión a Internet:
- Las transacciones pendientes se envían al servidor
- Los datos locales se actualizan con la información del servidor
- Se resuelven conflictos de concurrencia
- Se garantiza la consistencia de datos

### Funciones Atómicas de Inventario
El sistema utiliza funciones atómicas para la actualización de inventario que garantizan:
- Actualizaciones seguras de inventario
- Validación contra inventario reservado para traslados
- Control de errores y concurrencia
- Registro de auditoría para todas las operaciones

## Sistema de Seguridad y Roles

### Roles de Usuario
- **Cajera**: 
  - Acceso al POS de su tienda asignada
  - Procesamiento de ventas
  - Consulta de inventario limitado
  - Aplicación de descuentos (según permisos)

- **Gerente**:
  - Acceso al POS de su tienda
  - Gestión de inventario (ajustes, transferencias)
  - Consulta de reportes
  - Gestión de clientes
  - Consulta de ventas y cierres de caja

- **Administrador**:
  - Acceso completo al sistema
  - Gestión de usuarios y permisos
  - Configuración general
  - Gestión de productos y categorías
  - Acceso a todos los reportes

### Control de Acceso Basado en Roles (RBAC)
- Autenticación de usuarios con verificación de roles
- Protección de rutas según permisos
- Validación de datos en el servidor
- Políticas de seguridad en Supabase (RLS)

### Políticas de Seguridad (RLS - Row Level Security)
- Acceso restringido a datos según rol y tienda
- Aislamiento de datos entre tiendas
- Validación de permisos en la base de datos
- Auditoría de operaciones críticas

## Flujos de Negocio

### Flujo de Venta
1. El cajero inicia sesión en el POS de su tienda
2. Busca o escanea productos para agregarlos al carrito
3. Aplica descuentos si es necesario
4. Registra el pago (efectivo, tarjeta o combinado)
5. Confirma la venta y se imprime el ticket
6. El inventario se actualiza automáticamente
7. La venta se registra en la base de datos local
8. Al restablecer conexión, se sincroniza con el servidor

### Flujo de Traslado
1. Un usuario solicita un traslado desde una ubicación a otra
2. Se valida la disponibilidad de inventario
3. Se reserva el inventario (no se puede vender durante el traslado)
4. Se aprueba el traslado
5. Se confirma el envío desde la ubicación de origen
6. Se confirma la recepción en la ubicación de destino
7. Se actualiza el inventario en la ubicación de destino
8. Se libera la reserva del inventario
9. Se registra el movimiento en el historial

### Flujo de Gestión de Inventario
1. Se registran nuevos productos en el sistema
2. Se reciben productos en la bodega o tiendas
3. Se actualiza el inventario por lotes
4. Se monitorean los niveles de stock
5. Se generan alertas de stock bajo
6. Se planifican reabastecimientos
7. Se gestionan productos próximos a vencer

## Configuración y Despliegue

### Prerrequisitos
- Node.js 16+
- npm 7+
- Supabase proyecto configurado

### Variables de Entorno
```
VITE_SUPABASE_URL= # URL de tu proyecto Supabase
VITE_SUPABASE_ANON_KEY= # Clave anónima de Supabase
```

### Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Construir aplicación PWA
npm run build-pwa
```

### Despliegue
- Se puede desplegar en cualquier servicio que soporte archivos estáticos (Netlify, Vercel, etc.)
- Requiere conexión a un proyecto Supabase
- Implementación como PWA para funcionalidad offline