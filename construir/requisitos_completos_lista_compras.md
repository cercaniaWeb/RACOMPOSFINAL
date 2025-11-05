# Sistema Completo de Alertas, Lista de Compras y Gastos - Requisitos Funcionales

## Flujo Principal Completamente Integrado

### Flujo Completo: Alerta de Stock → Lista de Compras → Compra → Inventario Actualizado

1. **Alerta de Stock Bajo Generada** (automáticamente por sistema)
   - El sistema identifica productos con stock bajo según configuración
   - Se muestra notificación en la campana de alertas
   - El usuario puede elegir si desea "Añadir a Lista" o ignorar la alerta

2. **Selección Opcional para Lista de Compras**
   - El usuario decide si agregar el producto a la lista o no
   - Solo los productos seleccionados pasan a la lista de compras
   - Opcionalmente, se puede sugerir cantidad a comprar basada en nivel de stock

3. **Gestión de Lista de Compras**
   - Opción de agregar productos manualmente a la lista
   - Visualización de todos los productos pendientes de compra
   - Posibilidad de editar cantidades o eliminar productos de la lista

4. **Proceso de Compra en Central**
   - Visualización de la lista completa de compras
   - Marcar cada producto como comprado individualmente
   - Registro del precio pagado por unidad
   - Opción de incluir notas sobre el producto (proveedor, observaciones, etc.)

5. **Generación de Gastos e Inventario**
   - Al finalizar la compra, el sistema:
     * Registra el gasto en la tabla `expenses` de Supabase
     * Actualiza el inventario en la tabla `inventory_batches`
     * Aumenta la cantidad de producto en la ubicación correspondiente
     * Mantiene el historial de precios y proveedores si aplica

## Flujo Alternativo: Compra Directa sin Alerta

1. **Acceso Directo a Lista de Compras**
   - Usuario puede ir directamente a la lista de compras
   - Añadir productos manualmente con nombre, cantidad estimada
   - No requiere alerta previa

2. **Proceso de Compra y Registro**
   - Igual que el flujo principal a partir del paso 4

## Requisitos Técnicos Específicos

### 1. Sistema de Alertas Mejorado
- Botón "Añadir a Lista" opcional en cada alerta
- Posibilidad de sugerir cantidad a comprar basada en stock actual
- Filtro de alertas por tipo (stock bajo, vencimiento, etc.)

### 2. Lista de Compras Mejorada
- Buscador de productos desde catálogo existente
- Posibilidad de agregar productos sin stock exacto (nombre genérico)
- Categorización de productos pendientes (urgente, normal, opcional)
- Notas adicionales por producto
- Importación desde archivos si es necesario

### 3. Sistema de Compra y Registro
- Modo de verificación por producto (checkbox para cada ítem)
- Registro de precio unitario y total por producto
- Asociación con productos existentes del sistema si es posible
- Registro de proveedor/factura si aplica
- Fotos de recibos/bolsas si es necesario

### 4. Integración con Inventario
- Al generar gastos de productos, actualizar automáticamente el stock
- Crear o actualizar lotes en `inventory_batches`
- Mantener trazabilidad de compras anteriores
- Posibilidad de registrar caducidad si aplica

## Componentes Involucrados y Modificaciones Necesarias

### AlertsDropdown.jsx
- Mantener botón "Añadir a Lista" solo para alertas de stock bajo
- Asegurar que es opcional y no obligatorio

### ShoppingListModal.jsx
- Agregar opción de buscar productos del catálogo existente
- Implementar modo de verificación (checkbox, registro de precios)
- Agregar campo de notas por producto
- Permitir edición de cantidades antes de la compra

### Función addExpense en useAppStore.js
- Implementar lógica para actualizar inventario al registrar gastos de productos
- Diferenciar entre gastos operativos y compra de stock
- Conectar con sistema de inventario para aumentar cantidades

### Sistema de Inventario
- Modificar para aceptar actualizaciones desde sistema de compras
- Registrar movimientos de entrada por compra
- Actualizar costos promedio si aplica

## Beneficios del Sistema Completamente Integrado

1. **Control Total de Inventario**: Compras registradas aumentan stock automáticamente
2. **Trazabilidad Completa**: Desde alerta de stock bajo hasta registro de compra
3. **Toma de Decisiones Mejorada**: Datos históricos de precios y compras
4. **Eficiencia Operativa**: Flujo automatizado que reduce errores manuales
5. **Visibilidad Comercial**: Control de ROI y costos de reposición