# Requerimientos del Sistema: Productos por Peso con Balanza

## Requerimientos Funcionales

### RF-001: Gestión de Productos por Peso
**Descripción:** El sistema debe permitir registrar productos que se venden por peso, con posibilidad de fracciones exactas.

**Criterios de Aceptación:**
- Poder marcar un producto como "vendido por peso" en lugar de "por unidad"
- Permitir precios por unidad de medida (kg, gr, unidad, etc.)
- Permitir venta de fracciones exactas (0.500kg, 1.250kg, etc.)
- Mostrar precios por unidad de medida

**Campos necesarios:**
- `weightBased` (booleano): Indica si el producto se vende por peso
- `unitOfMeasure` (texto): kg, gr, lb, unidad, etc.
- `pricePerUnit` (decimal): Precio por unidad de medida
- `minimumWeight` (decimal): Peso mínimo para venta (opcional)
- `maximumWeight` (decimal): Peso máximo para venta (opcional)

### RF-002: Interfaz de Venta por Peso
**Descripción:** Interfaz rápida y sencilla para vender productos por peso, con acceso a productos comunes.

**Criterios de Aceptación:**
- Botones grandes para productos por peso más comunes (Jamon, Queso, Huevos)
- Visualización clara de peso, precio unitario y total
- Posibilidad de entrada manual de peso
- Acceso rápido a grupos de productos por peso

**Componentes necesarios:**
- `WeightProductQuickAccess`: Panel con botones grandes para productos comunes
- `WeightProductInterface`: Interfaz completa para productos por peso
- `WeightDisplay`: Visualización de peso en tiempo real
- `PriceCalculator`: Cálculo automático de precio total

### RF-003: Integración con Balanza
**Descripción:** Comunicación automática con dispositivo de pesaje para obtener lecturas de peso en tiempo real.

**Criterios de Aceptación:**
- Conexión con diferentes tipos de balanzas (USB, serial, Bluetooth)
- Recepción automática de lecturas de peso
- Indicador de estado de conexión con balanza
- Posibilidad de entrada manual si balanza no está disponible

**Protocolos de comunicación:**
- Puerto serial (RS-232)
- Puerto USB (con driver específico)
- Bluetooth (con emparejamiento)
- TCP/IP (si aplica)

### RF-004: Cálculo de Precio Automático
**Descripción:** Cálculo automático del precio total basado en peso real y precio por unidad de medida.

**Criterios de Aceptación:**
- Cálculo preciso del precio total (peso × precio por unidad)
- Manejo de decimales correctamente
- Actualización en tiempo real al cambiar peso o producto
- Validación de precios razonables

**Fórmula de cálculo:**
```
Precio Total = Peso Registrado × Precio por Unidad de Medida
```

### RF-005: Integración con Carrito de Compras
**Descripción:** Los productos por peso deben integrarse correctamente con el sistema de carrito existente.

**Criterios de Aceptación:**
- Producto por peso se agrega al carrito con peso exacto registrado
- Cantidad en carrito se calcula según peso (ej. 0.500kg)
- Precio total del carrito se actualiza correctamente
- Se puede editar el peso del producto después de agregarlo al carrito

## Requerimientos No Funcionales

### RNF-001: Rendimiento
- La lectura de peso debe actualizarse en menos de 1 segundo
- La interfaz debe responder a interacción del usuario en menos de 200ms
- El cálculo de precio debe ser instantáneo

### RNF-002: Disponibilidad
- El sistema debe funcionar con o sin conexión con balanza
- Debe haber modo manual como respaldo
- El sistema debe continuar operando si la balanza falla

### RNF-003: Precisión
- El cálculo de precios debe tener precisión de al menos 2 decimales
- El peso debe poder registrarse con precisión de 3 decimales (gramos)
- El sistema debe validar pesos fuera de rango

### RNF-004: Seguridad
- Solo usuarios autorizados pueden vender productos por peso
- Se debe registrar quién vendió cada producto por peso
- Se deben auditar cambios de precios manualmente

## Requerimientos Técnicos

### RT-001: Base de Datos
**Nuevos campos en tabla `products`:**
```sql
ALTER TABLE products ADD COLUMN weight_based BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN unit_of_measure VARCHAR(10) DEFAULT 'kg';
ALTER TABLE products ADD COLUMN price_per_unit DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN minimum_weight DECIMAL(8, 3);
ALTER TABLE products ADD COLUMN maximum_weight DECIMAL(8, 3);
```

### RT-002: API Endpoints
**Nuevos endpoints:**
- `GET /api/weight-products`: Obtener productos por peso
- `POST /api/calculate-price`: Calcular precio basado en peso y producto
- `POST /api/balance/connect`: Conectar con balanza
- `GET /api/balance/weight`: Obtener peso actual de balanza

### RT-003: Interfaces de Usuario

#### Panel de Acceso Rápido (Quick Access Panel)
```
[ Jamón ]    [ Queso ]    [ Huevos ]
[ Pollo ]   [ Pavo ]     [ Leche ]
[ + MÁS ] 
```

#### Interfaz de Producto por Peso
```
Producto: [ Jamón Serrano        v ]
Peso:     [ 0.500 kg ]  <-- Actualizado desde balanza
Precio/kg: $40.00
Total:    $20.00

[ Agregar al Carrito ]  [ Cancelar ]
```

## Requerimientos de Seguridad

### RS-001: Control de Acceso
- Solo cajeros autorizados pueden acceder a productos por peso
- Registro de todas las ventas por peso con usuario que las realizó
- Control de cambios de precios de productos por peso

### RS-002: Validación de Datos
- Validación de rangos de peso (mínimo y máximo)
- Validación de precios razonables
- Control de stock para productos por peso (si aplica)

## Requerimientos de Integración

### RI-001: Con Balanza
- Compatibilidad con diferentes marcas/modelos de balanza
- Protocolos de comunicación estándar
- Indicador de estado de conexión

### RI-002: Con Sistema Existente
- Compatible con el carrito actual
- Compatible con sistema de inventario (si aplica)
- Compatible con sistema de ventas y reportes
- Compatible con facturación electrónica

## Requerimientos de Pruebas

### Pruebas Unitarias
- Prueba de cálculo de precio por peso
- Prueba de conversión de unidades
- Prueba de validación de rangos

### Pruebas de Integración
- Prueba de conexión con balanza
- Prueba de integración con carrito
- Prueba de flujo completo de venta

### Pruebas de Usuario
- Prueba de usabilidad con cajeros
- Prueba de rendimiento en condiciones reales
- Prueba de error/rescate de fallas