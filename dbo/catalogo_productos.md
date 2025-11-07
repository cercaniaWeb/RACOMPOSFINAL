# Lógica del Catálogo de Productos

## Descripción General

El catálogo de productos es el módulo que permite a los usuarios visualizar los productos disponibles en el sistema. La lógica está diseñada para que los productos se muestren según la tienda en la que se encuentre el usuario, asegurando que solo vea lo que es relevante para su ubicación.

## Conexión con la Base de Datos

La funcionalidad del catálogo de productos se basa principalmente en las siguientes tablas de la base de datos:

1.  **`products`**: Esta tabla contiene la información maestra de cada producto, como el nombre, precio, costo, SKU, código de barras y categoría. Es la fuente principal de datos para cada artículo.

2.  **`inventory_batches`**: Esta tabla es crucial para determinar la disponibilidad de un producto en una tienda específica. Contiene registros de lotes de productos, cada uno con una cantidad, una ubicación (`location_id`) y una fecha de vencimiento.

3.  **`stores`**: Define las diferentes ubicaciones del sistema (Bodega Central, Tienda 1, Tienda 2).

## Lógica de Funcionamiento

Cuando un usuario accede al catálogo de productos, el sistema sigue esta lógica:

1.  **Identificación de la Tienda**: El sistema primero identifica la tienda (`store_id`) asignada al usuario que ha iniciado sesión. Esta información se obtiene del perfil del usuario, gestionado a través de la tabla `users`.

2.  **Consulta de Productos**: La aplicación realiza una consulta a la base de datos para obtener los productos. La consulta no trae todos los productos del sistema, sino que los filtra según las siguientes condiciones:

    *   **Existencia en la Tienda**: Un producto se considera "existente" en una tienda si hay al menos un registro en la tabla `inventory_batches` que asocie ese producto (`product_id`) con la ubicación de la tienda (`location_id`).

    *   **Stock Disponible**: Para que un producto se muestre como "disponible" para la venta, la suma de las cantidades (`quantity`) de todos sus lotes en la `inventory_batches` para esa tienda debe ser mayor que cero.

3.  **Visualización**: Los productos que cumplen con estas condiciones se muestran en la interfaz del catálogo. La información del producto (nombre, precio, imagen) se obtiene de la tabla `products`, mientras que la disponibilidad se calcula a partir de `inventory_batches`.

## Ejemplo de Flujo

*   Un cajero de la **Tienda 1** inicia sesión.
*   Accede al módulo del catálogo de productos.
*   El sistema ejecuta una consulta que busca en `inventory_batches` todos los `product_id` que tengan un `location_id` igual a "Tienda 1" y una `quantity` mayor a 0.
*   Luego, el sistema utiliza esos `product_id` para obtener la información completa de los productos desde la tabla `products`.
*   El resultado es una lista de productos que están físicamente en stock en la Tienda 1, que es lo que se muestra al cajero.

De esta manera, el catálogo de productos es dinámico y siempre refleja el inventario real de cada tienda, evitando confusiones y asegurando que solo se puedan vender los productos que están en existencia en esa ubicación.