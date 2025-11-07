# Lógica del Proceso de Transferencias

## Descripción General

El proceso de transferencias es una funcionalidad clave en un sistema multi-sucursal como RECOOM POS. Permite mover inventario de una ubicación a otra (por ejemplo, de la Bodega Central a la Tienda 1) de una manera controlada y auditable. El sistema está diseñado para manejar el inventario "en tránsito" y asegurar que el stock se refleje correctamente en ambas ubicaciones durante todo el proceso.

## Conexión con la Base de Datos

El módulo de transferencias utiliza las siguientes tablas principales:

1.  **`transfers`**: Esta tabla es el corazón del módulo. Cada fila representa una Orden de Traslado (OT) y contiene:
    *   `origin_location_id` y `destination_location_id`: Las ubicaciones de origen y destino.
    *   `status`: El estado actual de la transferencia (`solicitado`, `enviado`, `recibido`, `cancelado`).
    *   `items`: Un `JSONB` con la lista de productos y cantidades solicitadas.
    *   `history`: Un `JSONB` que audita los cambios de estado, quién los hizo y cuándo.

2.  **`inventory_batches`**: El inventario se descuenta del origen y se incrementa en el destino a partir de esta tabla.

3.  **`reserved_inventory`** (Tabla Implícita): Aunque no se define explícitamente en el esquema principal, las funciones de inventario sugieren la existencia de una tabla o un mecanismo para gestionar el inventario "reservado" o "congelado". Esta tabla es fundamental para evitar que el stock destinado a una transferencia sea vendido por error.

## Lógica de Funcionamiento

El flujo de una transferencia sigue varios pasos, cada uno con un impacto en la base de datos:

1.  **Creación de la Solicitud (Estado: `solicitado`)**:
    *   Un usuario con permisos (`gerente` o `admin`) crea una nueva orden de traslado desde una ubicación de origen a un destino.
    *   Antes de crear la solicitud, el sistema valida la disponibilidad del stock en el origen utilizando la función `validate_transfer_availability`.
    *   Esta función comprueba que la cantidad solicitada de cada producto no sea mayor que el inventario disponible (total - reservado) en la ubicación de origen.
    *   Si hay stock suficiente, se crea un nuevo registro en la tabla `transfers` con el estado `solicitado`.

2.  **Confirmación de Envío (Estado: `enviado`)**:
    *   Un usuario en la ubicación de origen confirma que los productos han sido enviados.
    *   En este punto, el sistema **"congela"** el inventario. Esto se logra creando registros en la tabla `reserved_inventory` que asocian los lotes de `inventory_batches` con la transferencia.
    *   La cantidad reservada se descuenta del inventario *disponible* del origen, pero **no del inventario total**. Esto significa que el stock sigue físicamente en el origen, pero no puede ser vendido ni utilizado en otra transferencia.
    *   El estado de la transferencia en la tabla `transfers` se actualiza a `enviado` y se añade una entrada al `history`.

3.  **Confirmación de Recepción (Estado: `recibido`)**:
    *   Cuando los productos llegan a la ubicación de destino, un usuario en esa ubicación confirma la recepción.
    *   En este paso crítico, ocurren dos cosas de forma atómica:
        *   **Descuento del Origen**: La cantidad de los lotes reservados se descuenta ahora sí de forma definitiva de la `quantity` en la tabla `inventory_batches` en la ubicación de origen.
        *   **Incremento en el Destino**: Se crean nuevos lotes (o se actualizan los existentes) en `inventory_batches` para la ubicación de destino, incrementando su stock.
    *   Los registros correspondientes en `reserved_inventory` se eliminan o se marcan como completados.
    *   El estado de la transferencia en la tabla `transfers` se actualiza a `recibido`.

## Manejo de Discrepancias

Si al recibir los productos en el destino se detectan faltantes o sobrantes, el usuario puede registrar estos ajustes. El sistema actualizará el inventario del destino solo con la cantidad realmente recibida y puede generar un reporte de discrepancia para que los administradores lo investiguen.

Esta lógica asegura un control estricto sobre el inventario en movimiento, previene errores como la venta de stock que ya no está disponible y proporciona una auditoría completa de todo el proceso de traslado.