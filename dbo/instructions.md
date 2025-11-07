### Guía de Replicación del Sistema RECOOM POS

Sigue estos pasos para configurar una copia funcional del sistema en tu propio entorno.

#### Parte 1: Configuración de la Base de Datos (Supabase)

1.  **Crear un Proyecto en Supabase:**
    *   Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
    *   Guarda la **URL del proyecto** y la clave de API **`anon` (public)**. Las necesitarás para configurar la aplicación.

2.  **Aplicar el Esquema de la Base de Datos:**
    *   En el panel de tu proyecto de Supabase, ve al **"SQL Editor"**.
    *   Copia todo el contenido del archivo `supabase_schema.sql`.
    *   Pega el contenido en el editor de SQL y ejecútalo. Esto creará todas las tablas (`products`, `sales`, `users`, etc.) y los índices necesarios.

3.  **Implementar la Lógica de Negocio (Funciones SQL):**
    *   Abre el archivo `atomic_inventory_functions.sql`.
    *   Copia y pega su contenido en el **"SQL Editor"** de Supabase.
    *   Ejecuta el script. Esto implementará las funciones del lado del servidor para gestionar el inventario de forma atómica y segura.

4.  **Configurar la Seguridad a Nivel de Fila (RLS):**
    *   Este es un paso **crítico** para la seguridad. Debes aplicar las políticas RLS para cada tabla sensible.
    *   **Tabla `products`**: Copia y ejecuta el contenido de `products_rls_policies.sql` en el editor SQL.
    *   **Tabla `sales`**: Copia y ejecuta el contenido de `sales_rls_policies.sql`.
    *   **Otras tablas**: Deberás hacer lo mismo para `inventory_batches`, `transfers`, `clients`, etc. Te puedo proporcionar los scripts SQL para estas tablas, siguiendo la misma lógica de roles (`admin`, `gerente`, `cajera`) y `store_id`.

5.  **Insertar Datos Iniciales (Recomendado):**
    *   Para que el sistema sea funcional, necesitarás datos básicos como las tiendas, categorías de productos y roles de usuario.
    *   Te proporcionaría un script SQL para insertar estos datos iniciales (ej. las tiendas "Bodega Central", "Tienda 1" y "Tienda 2").

#### Parte 2: Configuración de la Aplicación (React)

1.  **Clonar o Copiar el Proyecto:**
    *   Copia todo el código fuente del proyecto a tu máquina local.

2.  **Instalar Dependencias:**
    *   Abre una terminal en el directorio raíz del proyecto y ejecuta el comando `npm install`.

3.  **Configurar las Variables de Entorno:**
    *   Crea un archivo llamado `.env.local` en la raíz del proyecto.
    *   Copia el contenido del archivo `.env.example` y pégalo en tu nuevo archivo `.env.local`.
    *   Reemplaza los valores de ejemplo con la **URL** y la clave **`anon`** de tu proyecto de Supabase:
        ```
        VITE_SUPABASE_URL=TU_URL_DE_SUPABASE
        VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
        ```

4.  **Ejecutar la Aplicación:**
    *   En la terminal, ejecuta `npm run dev` para iniciar el servidor de desarrollo.
    *   La aplicación debería estar funcionando y conectada a tu nueva base de datos en Supabase.

#### Parte 3: Gestión de Usuarios y Roles

1.  **Crear un Usuario Administrador:**
    *   En el panel de Supabase, ve a la sección **"Authentication"** y crea un nuevo usuario. Este será tu usuario `admin`.
    *   Luego, ve a la tabla `users` (en "Table Editor") y asigna manualmente el rol `"admin"` a este nuevo usuario.

2.  **Probar los Permisos:**
    *   Inicia sesión en la aplicación con tu usuario `admin` y verifica que tienes acceso a todas las funcionalidades.
    *   Desde el panel de administrador de la aplicación, crea un usuario `gerente` y otro `cajera`, y asígnalos a tiendas diferentes.
    *   Cierra sesión e inicia sesión con estos nuevos usuarios para confirmar que las políticas RLS funcionan correctamente (por ejemplo, que un cajero solo ve las ventas de su tienda).
