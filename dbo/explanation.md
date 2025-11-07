### Configuración en la Base de Datos (Supabase/PostgreSQL)

La configuración de la base de datos se gestiona directamente en Supabase a través de scripts SQL y sus funcionalidades nativas.

1.  **Definición del Esquema:**
    *   El archivo `supabase_schema.sql` define la estructura central de la base de datos. Crea las tablas (`products`, `inventory_batches`, `sales`, `users`, etc.), establece las columnas con sus tipos de datos y las restricciones básicas.
    *   El esquema está diseñado para un sistema multi-tienda, utilizando `store_id` o `location_id` para segmentar los datos por ubicación.
    *   Se usan `UUID` como claves primarias, una buena práctica para sistemas distribuidos.
    *   Se aprovecha el tipo de dato `JSONB` para almacenar datos flexibles como el carrito de compras (`sales.cart`) o umbrales de stock (`products.min_stock_threshold`).

2.  **Lógica de Negocio (Funciones Atómicas):**
    *   El archivo `atomic_inventory_functions.sql` define funciones del lado del servidor en PostgreSQL.
    *   Estas funciones (`atomic_update_inventory_batches_with_audit`, `get_available_inventory`, etc.) contienen la lógica crítica para gestionar el inventario de forma segura y consistente.
    *   Al tener esta lógica en la base de datos, se asegura la integridad de los datos sin importar desde dónde se realicen las operaciones (la app, un panel de administrador, etc.).
    *   Esta lógica también contempla el inventario "congelado" para traslados, una función clave para un sistema multi-sucursal.

3.  **Seguridad (Row-Level Security - RLS):**
    *   Los archivos `products_rls_policies.sql` y `sales_rls_policies.sql` definen las reglas de seguridad a nivel de fila.
    *   RLS es una potente característica de Supabase que permite controlar exactamente qué filas puede ver, modificar o eliminar un usuario.
    *   Las políticas se basan en el rol del usuario (`cajera`, `gerente`, `admin`) y su tienda asignada (`store_id`). Por ejemplo, un `cajera` solo puede ver las ventas de su propia tienda.
    *   Este es un método muy seguro y eficiente para aislar los datos y controlar el acceso.

### Configuración en la Aplicación (React)

La configuración del lado de la aplicación se detalla en los archivos de documentación y se infiere de la estructura del proyecto.

1.  **Integración con Supabase:**
    *   Según la documentación, toda la comunicación con Supabase se centraliza en `src/config/` (para inicializar el cliente de Supabase) y se expone a través de funciones en `src/api/`.
    *   Los componentes de React no interactúan directamente con Supabase, sino que llaman a estas funciones de la API, manteniendo el código ordenado.

2.  **Variables de Entorno:**
    *   La presencia de archivos como `.env.example` y `.env.local` indica que la aplicación carga las credenciales de Supabase (URL y clave `anon`) de forma segura desde variables de entorno, evitando exponerlas en el código fuente.

3.  **Gestión de Estado Global:**
    *   La documentación menciona el uso de **Redux Toolkit** o **Zustand**. Esto es fundamental para gestionar en tiempo real el estado del carrito de compras, el stock distribuido y la información del usuario autenticado (rol, tienda, etc.).

4.  **Rutas Protegidas:**
    *   El archivo `src/App.jsx` funciona como el enrutador principal.
    *   Utiliza un sistema de `ProtectedRoutes` que lee el rol del usuario desde el estado global y le permite o deniega el acceso a ciertas rutas (por ejemplo, solo un `admin` puede acceder a `/admin`). Esto se complementa con las políticas RLS de la base de datos.

### Flujo de Configuración Resumido

1.  La aplicación React se inicia y carga las credenciales de Supabase desde las variables de entorno.
2.  Se inicializa un cliente de Supabase en `src/config/`.
3.  Cuando un usuario inicia sesión, la aplicación lo autentica con Supabase, obtiene su rol y `store_id`, y guarda esta información en el estado global.
4.  El enrutador de la aplicación muestra las vistas permitidas para el rol del usuario.
5.  Cuando la aplicación necesita datos, llama a las funciones de `src/api/`.
6.  Supabase recibe la petición y, gracias a las políticas RLS, filtra automáticamente los datos para que el usuario solo reciba lo que tiene permitido ver.
7.  Para operaciones complejas (como un ajuste de inventario), la app llama a una función de base de datos (`atomic_update_inventory_batches_with_audit`), que ejecuta la lógica de negocio de forma segura en el servidor.

Esta arquitectura combina la configuración del cliente y del servidor para crear un sistema seguro, robusto y escalable.
