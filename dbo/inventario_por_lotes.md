# Lógica del Inventario por Lotes

## Descripción General

El sistema de inventario por lotes es una de las características más importantes de RECOOM POS, ya que permite un control granular del stock. En lugar de tener una única cantidad para cada producto, el inventario se gestiona en "lotes", donde cada lote tiene su propia cantidad, costo y fecha de vencimiento. Esto es fundamental para la gestión de productos perecederos y para un cálculo de costos preciso.

Este módulo está diseñado para mostrar el inventario existente en una tienda específica, y es la base sobre la cual opera el Terminal Punto de Venta (TPV) para determinar si un producto puede ser vendido.

## Conexión con la Base de Datos

La lógica del inventario por lotes se centra en la tabla `inventory_batches`:

*   **`inventory_batches`**: Esta tabla es el corazón del sistema de inventario. Cada fila representa un lote de un producto en una ubicación específica.
    *   `product_id`: Vincula el lote a un producto de la tabla `products`.
    *   `location_id`: Indica la tienda o bodega donde se encuentra el lote.
    *   `quantity`: La cantidad de unidades de producto en ese lote.
    *   `cost`: El costo de adquisición de los productos en ese lote, permitiendo un cálculo de ganancias preciso.
    *   `expiration_date`: La fecha de vencimiento del lote, crucial para la gestión de mermas.

## Lógica de Funcionamiento

1.  **Visualización del Inventario**: Cuando un usuario con los permisos adecuados (como un `gerente` o `admin`) accede a la sección de inventario, el sistema filtra los registros de `inventory_batches` por la `location_id` de la tienda del usuario. Esto le permite ver todos los lotes de productos que existen físicamente en su tienda.

2.  **Consumo desde el TPV**: El TPV (Punto de Venta) consume la información de esta tabla para determinar si un producto puede ser vendido. La lógica es la siguiente:

    *   **Disponibilidad del Producto**: Antes de que un producto pueda ser agregado al carrito de ventas, el sistema verifica que haya stock disponible. Para ello, utiliza la función de base de datos `get_available_inventory(product_id, store_id)`.
    *   Esta función calcula la cantidad total de un producto en una tienda sumando las `quantity` de todos sus lotes en la tabla `inventory_batches` para esa `location_id`.
    *   **Condición Clave**: Si la cantidad total disponible es mayor que cero, el producto se puede vender. De lo contrario, el TPV mostrará el producto como "sin existencias" y no permitirá agregarlo al carrito.

3.  **Actualización del Inventario tras una Venta**:
    *   Cuando se completa una venta, el sistema debe descontar la cantidad vendida del inventario. Para ello, se sigue una estrategia de **FIFO (First-In, First-Out)** o **FEFO (First-Expired, First-Out)**, dependiendo de la configuración.
    *   El sistema identifica el lote más antiguo o el más próximo a vencer (según la estrategia) y descuenta la cantidad vendida de la `quantity` de ese lote en la tabla `inventory_batches`.
    *   Si la cantidad vendida es mayor que la del lote más antiguo, el sistema lo deja en cero y pasa al siguiente lote más antiguo, y así sucesivamente hasta que se haya descontado toda la cantidad vendida. Esta operación se realiza de forma atómica para garantizar la consistencia de los datos.

## Resumen de Condiciones

*   **Para que un producto se muestre en el TPV**: Debe tener una entrada en `inventory_batches` para la tienda actual.
*   **Para que un producto esté "en stock"**: La suma de las `quantity` de todos sus lotes en la tienda debe ser mayor que cero.
*   **Para que no haya existencias**: Si la suma de las cantidades es cero o no hay ningún lote para ese producto en la tienda, el producto se considera "agotado".

Esta lógica asegura que el TPV siempre refleje el estado real del inventario, previene la venta de productos que no están en stock y permite un seguimiento detallado de cada unidad de producto dentro del sistema.