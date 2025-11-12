# Documentación: Funcionalidad de Impresión y Guardado de Tickets

## Descripción General

Se ha implementado la funcionalidad para imprimir y guardar tickets tanto para ventas individuales como para cierres de caja en el sistema de Punto de Venta (POS).

## Características Implementadas

### 1. Impresión y Guardado de Tickets de Venta

**Ubicación:** `src/pages/POSPage.jsx`

**Funcionalidad:**
- Al finalizar una venta exitosamente, se abre un modal de opciones de ticket
- El modal muestra el ticket con los detalles de la venta
- Se han agregado dos botones: "Imprimir Ticket" y "Guardar Ticket"
- El botón "Imprimir Ticket" utiliza la librería `react-to-print` para imprimir directamente
- El botón "Guardar Ticket" convierte el ticket a PDF usando `html2canvas` y `jsPDF`

**Detalle del proceso de guardado para ventas:**
1. Se captura el contenido del ticket usando `html2canvas`
2. Se crea un archivo PDF con `jsPDF` a partir de la imagen capturada
3. El archivo se descarga con un nombre como `ticket_venta_{saleId}.pdf`

### 2. Impresión y Guardado de Tickets de Cierre de Caja

**Ubicación:** `src/features/pos/CashClosingModal.jsx`

**Funcionalidad:**
- Al realizar un cierre de caja, se abre un modal de previsualización del ticket
- El modal muestra los detalles del cierre de caja
- Se han agregado dos botones: "Imprimir Ticket" y "Guardar Ticket"
- El botón "Imprimir Ticket" utiliza la librería `react-to-print` para imprimir directamente
- El botón "Guardar Ticket" convierte el ticket a PDF usando `html2canvas` y `jsPDF`

**Detalle del proceso de guardado para cierres de caja:**
1. Se captura el contenido del ticket usando `html2canvas`
2. Se crea un archivo PDF con `jsPDF` a partir de la imagen capturada
3. El archivo se descarga con un nombre como `cierre_caja_{fecha}_{cajero}.pdf`

## Dependencias Adicionales

Las siguientes dependencias son necesarias para la funcionalidad:
- `html2canvas`: Para capturar el contenido del ticket como imagen
- `jspdf`: Para crear archivos PDF a partir de imágenes
- `react-to-print`: Para la funcionalidad de impresión directa

## Archivos Modificados

1. `src/pages/POSPage.jsx`:
   - Se agregó la función `handleSaveTicket` 
   - Se actualizó el evento onClick del botón "Guardar Ticket"

2. `src/features/pos/CashClosingModal.jsx`:
   - Se agregaron importaciones para `html2canvas` y `jsPDF`
   - Se agregó la función `handleSaveTicket`
   - Se agregó el botón "Guardar Ticket" en el modal

## Uso de la Funcionalidad

### Para Ventas:
1. Complete una venta normalmente
2. Después del pago exitoso, aparecerá el modal de opciones de ticket
3. Haga clic en "Imprimir Ticket" para imprimir directamente
4. Haga clic en "Guardar Ticket" para descargar el ticket como PDF

### Para Cierres de Caja:
1. Vaya a la opción "Cierre de Caja" desde la pantalla de POS
2. Complete los detalles de cierre de caja
3. Haga clic en "Cerrar Caja"
4. Aparecerá el modal de previsualización del ticket
5. Haga clic en "Imprimir Ticket" para imprimir directamente
6. Haga clic en "Guardar Ticket" para descargar el ticket como PDF

## Personalización de Tickets

La apariencia de los tickets puede personalizarse a través de la funcionalidad existente de diseño de tickets:
- Encabezado del ticket
- Pie de página del ticket
- Mostrar código QR
- Tamaño de fuente
- Logo del ticket

Estas configuraciones se pueden modificar a través del modal de edición de diseño de ticket accesible desde la página de ajustes.

## Consideraciones Técnicas

1. Los tickets se generan en formato PDF con orientación vertical
2. El tamaño del PDF se adapta al tamaño del contenido del ticket
3. La funcionalidad de guardado requiere que el navegador tenga soporte para canvas
4. En entornos offline, la funcionalidad de guardado seguirá funcionando pero no se sincronizará con el servidor hasta que se restablezca la conexión

## Pruebas Realizadas

Se han creado pruebas unitarias para verificar:
- Que los botones de impresión y guardado aparecen correctamente
- Que las funciones de impresión y guardado se llaman cuando se hacen clic
- Que se crean archivos PDF correctamente con los datos del ticket

Los archivos de prueba incluyen:
- `src/test/pos-ticket-saving.test.jsx`
- `src/test/cash-closing-ticket-saving.test.jsx`

## Integración con el Sistema

Esta funcionalidad se integra completamente con:
- El sistema de autenticación del usuario
- El estado global de la tienda (store)
- La funcionalidad offline-first del sistema
- El sistema de notificaciones

## Posibles Mejoras Futuras

1. Soporte para impresión en impresoras térmicas de tickets
2. Opciones de formato de archivo adicionales (como PNG o JPEG)
3. Integración con servicios de almacenamiento en la nube
4. Opciones de personalización avanzada de los formatos de ticket