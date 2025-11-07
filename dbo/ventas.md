# Lógica del Proceso de Ventas

## Descripción General

El proceso de ventas es el núcleo del sistema POS. Está diseñado para ser rápido, eficiente y, lo más importante, para mantener la integridad del inventario y los registros financieros. Cada venta que se realiza en el TPV (Terminal Punto de Venta) sigue un flujo de trabajo estricto que interactúa con varias tablas de la base de datos.

## Conexión con la Base de Datos

El proceso de ventas involucra principalmente las siguientes tablas:

1.  **`sales`**: En esta tabla se registra cada transacción. Contiene toda la información de la venta, incluyendo los productos vendidos (`cart`), el subtotal, los descuentos, el total, el método de pago y el cajero que la realizó.
    *   El campo `cart` es un `JSONB` que almacena un array de los productos vendidos, con su cantidad, precio al momento de la venta, y costo.

2.  **`inventory_batches`**: Esta tabla es fundamental, ya que el stock de los productos vendidos debe ser descontado de aquí. La venta afecta directamente las `quantity` de los lotes de inventario.

3.  **`users`**: Se utiliza para identificar al cajero y la tienda (`store_id`) donde se realiza la venta.

## Lógica de Funcionamiento

El flujo de una venta es el siguiente:

1.  **Creación del Carrito de Compras**:
    *   El cajero agrega productos al carrito en la interfaz del TPV.
    *   Antes de agregar cada producto, el sistema verifica su disponibilidad utilizando la función `get_available_inventory(product_id, store_id)`, que consulta la tabla `inventory_batches`.
    *   Si hay stock, el producto se agrega al carrito. Si no, se muestra un mensaje de "stock insuficiente".

2.  **Finalización de la Venta**:
    *   Una vez que el cliente está listo para pagar, el cajero finaliza la venta.
    *   En este punto, la aplicación recopila toda la información del carrito (productos, cantidades, precios), calcula el subtotal, aplica los descuentos si los hay, y calcula el total final.

3.  **Registro de la Venta (Transacción)**:
    *   La aplicación crea un nuevo registro en la tabla `sales` con todos los detalles de la transacción. Este paso es crucial para el registro financiero y los reportes.

4.  **Actualización Atómica del Inventario**:
    *   Inmediatamente después de registrar la venta, el sistema debe actualizar el inventario. Esta es la parte más crítica del proceso y se realiza de forma atómica para evitar inconsistencias.
    *   La aplicación llama a una función del lado del servidor (similar a `atomic_update_inventory_batches_with_audit`) con la lista de productos y cantidades vendidas.
    *   Esta función de la base de datos se encarga de descontar las cantidades de los lotes correspondientes en la tabla `inventory_batches`.
    *   La estrategia para descontar el stock suele ser **FEFO (First-Expired, First-Out)**: el sistema primero descuenta del lote con la fecha de vencimiento más próxima. Si ese lote se agota, continúa con el siguiente, y así sucesivamente.
    *   Al ser una operación atómica, si algo falla durante la actualización del inventario, toda la operación se revierte, evitando que se registre una venta sin que se descuente el stock.

## Ejemplo de Flujo

1.  Un cliente lleva a la caja 2 unidades del producto "Leche Entera".
2.  El cajero escanea el producto. El sistema verifica en `inventory_batches` que haya al menos 2 unidades de "Leche Entera" en la tienda actual.
3.  El producto se agrega al carrito.
4.  El cliente paga y el cajero finaliza la venta.
5.  Se crea un nuevo registro en la tabla `sales` con los detalles de la venta.
6.  El sistema llama a la función de actualización de inventario, que busca el lote de "Leche Entera" más próximo a vencer en `inventory_batches` y le resta 2 unidades a su `quantity`.
7.  Si el lote tenía 10 unidades, ahora tendrá 8. Si tenía 1, lo dejará en 0 y buscará el siguiente lote para descontar la unidad restante.

Esta lógica garantiza que cada venta quede registrada correctamente y que el inventario se mantenga siempre sincronizado con las ventas realizadas.