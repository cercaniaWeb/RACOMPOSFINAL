# Lógica del Proceso de Cierre de Caja

## Descripción General

El proceso de cierre de caja es una operación diaria fundamental para cualquier punto de venta. Permite al cajero y a los gerentes verificar que el dinero en efectivo y los comprobantes de pago con tarjeta coincidan con las ventas registradas en el sistema durante un turno o un día. Este proceso es crucial para la contabilidad y la detección de posibles descuadres.

## Conexión con la Base de Datos

El cierre de caja se apoya en las siguientes tablas:

1.  **`cash_closings`**: Esta es la tabla principal del módulo. Cada vez que se realiza un cierre, se crea un nuevo registro aquí. Almacena un resumen completo del día, incluyendo:
    *   `initial_cash`: El efectivo inicial con el que comenzó el turno.
    *   `total_sales_amount`: El monto total de todas las ventas (efectivo y tarjeta).
    *   `total_cash_sales` y `total_card_sales`: Desglose de las ventas por método de pago.
    *   `final_cash`: El efectivo que debería haber en caja al final del día.
    *   `sales`: Un campo `JSONB` que contiene un array de los IDs de las ventas incluidas en ese cierre, para una fácil auditoría.

2.  **`sales`**: El sistema consulta esta tabla para obtener todas las ventas que no han sido incluidas en un cierre de caja anterior. Se filtran las ventas por `store_id` y por fecha/hora para el turno correspondiente.

## Lógica de Funcionamiento

El proceso de cierre de caja sigue estos pasos:

1.  **Inicio del Proceso**: El cajero inicia el proceso de cierre desde el TPV.

2.  **Recopilación de Ventas no Cerradas**:
    *   El sistema realiza una consulta a la tabla `sales` para encontrar todas las ventas que se han realizado en la tienda (`store_id`) desde el último cierre de caja.
    *   Para lograr esto, el sistema podría marcar las ventas como "cerradas" después de incluirlas en un cierre, o simplemente buscar ventas cuya fecha sea posterior a la fecha del último registro en `cash_closings` para esa tienda.

3.  **Cálculo de Totales**:
    *   Con la lista de ventas del turno, el sistema calcula automáticamente los siguientes valores:
        *   **Total de Ventas en Efectivo**: Suma de los campos `cash` de todos los registros de `sales`.
        *   **Total de Ventas con Tarjeta**: Suma de los campos `card` de todos los registros de `sales`.
        *   **Total de Ventas General**: La suma de ambos.

4.  **Cálculo del Efectivo Final Esperado**:
    *   El sistema calcula el efectivo que teóricamente debería haber en la caja con la siguiente fórmula:
        ```
        Efectivo Final = Efectivo Inicial + Total de Ventas en Efectivo
        ```
    *   Este cálculo no considera otros movimientos de caja como gastos o ingresos, a menos que se incluyan en la lógica.

5.  **Registro del Cierre de Caja**:
    *   El sistema presenta al cajero un resumen con los totales calculados.
    *   El cajero debe contar el dinero físico en la caja e introducir el monto en el sistema (este es el "conteo real").
    *   Se crea un nuevo registro en la tabla `cash_closings` con todos los datos: efectivo inicial, totales de ventas, efectivo final esperado, y el conteo real ingresado por el cajero.
    *   El sistema también guarda los IDs de las ventas procesadas en el campo `sales` del registro de cierre.

6.  **Verificación de Descuadres**:
    *   El sistema compara el efectivo final esperado con el conteo real.
    *   Si hay una diferencia (un "descuadre"), se resalta en el reporte de cierre para que el gerente o administrador pueda investigarlo.

## Ejemplo de Flujo

1.  Un cajero comienza el día con $500 en caja (`initial_cash`).
2.  Durante su turno, realiza ventas por un total de $2,300 ($1,500 en efectivo y $800 con tarjeta).
3.  Al final del día, inicia el cierre de caja.
4.  El sistema consulta la tabla `sales` y calcula que `total_cash_sales` es $1,500.
5.  Calcula que el efectivo final esperado es `$500 (inicial) + $1,500 (ventas) = $2,000`.
6.  El cajero cuenta el dinero y tiene $1,995. Ingresa este monto.
7.  Se crea un registro en `cash_closings` con todos los totales y se resalta un descuadre de -$5.

Este proceso asegura que haya un registro contable diario y facilita la detección de errores o problemas en el manejo del efectivo.