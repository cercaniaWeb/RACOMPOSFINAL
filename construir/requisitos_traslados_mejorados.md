# Requisitos para la Nueva Funcionalidad de Traslados

## 1. Traslados entre Tiendas (Multi-destino)

### Requisitos Técnicos:
- Permitir seleccionar cualquier tienda como origen y destino (no solo bodega-central)
- Validar que el usuario tenga permisos en la tienda origen
- Ajustar correctamente el inventario en ambas ubicaciones (origen y destino)

### Cambios necesarios en el Store:
- Actualizar `createTransferRequest` para aceptar `originLocationId` dinámico
- Modificar la lógica de `shipTransfer` para reducir inventario del origen correcto
- Corregir la lógica de `receiveTransfer` para aumentar inventario en destino correcto

## 2. Funcionalidad de Checkeo por Producto (Recepción Detallada)

### Requisitos de UI/UX:
- En la vista de recepción, mostrar cada producto con un checkbox
- Permitir marcar productos que fueron recibidos correctamente
- Permitir indicar cantidades recibidas diferentes a las enviadas
- Mostrar estado por producto (recibido/completo, recibido/parcial, faltante)

### Implementación Técnica:
- Agregar campo `itemsReceived` en el estado de recepción
- Para cada producto: `{ productId, productName, sentQuantity, receivedQuantity, checked: boolean, notes: string }`
- Permitir actualizar cantidades recibidas individualmente

## 3. Campo de Notas/Comentarios

### Requisitos:
- Agregar campo de texto para notas en el traslado
- Permitir notas por producto
- Almacenar historial de comentarios en la tabla `transfers`
- Opcional: posibilidad de adjuntar archivos/fotos

### Estructura de datos:
```javascript
transfer: {
  id: string,
  originLocationId: string,
  destinationLocationId: string,
  requestedBy: string,
  createdAt: string,
  status: string,
  note: string,  // Campo general de notas
  items: [
    {
      productId: string,
      productName: string,
      requestedQuantity: number,
      sentQuantity: number,
      receivedQuantity: number,
      itemNote: string,  // Nota específica por producto
      receivedStatus: 'pending' | 'complete' | 'partial' | 'missing'
    }
  ],
  history: [
    {
      status: string,
      date: string,
      userId: string,
      note?: string  // Notas específicas por evento
    }
  ]
}
```

## 4. Componente de Recepción Mejorado

### Funcionalidades:
- Vista de lista de productos con checkboxes individuales
- Inputs para cantidades recibidas por producto
- Campo de texto por producto para notas/observaciones
- Botón de "Recibir Todo" para marcar todos como completos rápidamente
- Indicadores visuales para productos faltantes o con discrepancias

### Estructura del componente ReceiveAction:
```jsx
const ReceiveAction = ({ transfer }) => {
  const [receivedItems, setReceivedItems] = useState(
    transfer.items.map(item => ({
      ...item,
      receivedQuantity: item.sentQuantity || item.requestedQuantity,
      checked: false,
      itemNote: '',
      receivedStatus: 'pending'
    }))
  );

  const handleItemCheck = (productId) => {
    setReceivedItems(prev => 
      prev.map(item => 
        item.productId === productId 
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  const handleQuantityChange = (productId, value) => {
    setReceivedItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, receivedQuantity: parseInt(value) || 0, checked: true }
          : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <p>Marca los productos que recibiste y ajusta cantidades si es necesario:</p>
      
      {receivedItems.map(item => (
        <div key={item.productId} className="flex items-center space-x-3 p-2 border rounded">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => handleItemCheck(item.productId)}
          />
          <span className="flex-1">{item.productName}</span>
          <input
            type="number"
            value={item.receivedQuantity}
            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
            className="w-20 border rounded px-2"
          />
          <input
            type="text"
            placeholder="Notas..."
            value={item.itemNote}
            onChange={(e) => handleItemNoteChange(item.productId, e.target.value)}
            className="flex-1 border rounded px-2"
          />
        </div>
      ))}
      
      <div className="flex space-x-3">
        <Button onClick={handleReceiveAll}>
          Recibir Todo
        </Button>
        <Button onClick={handleSubmit}>
          Confirmar Recepción
        </Button>
      </div>
    </div>
  );
};
```

## 5. Validaciones y Seguridad

### Validaciones:
- Verificar stock disponible antes de aprobar/enviar
- Validar que el usuario tenga permisos en tiendas origen y destino
- No permitir recibir más productos de los enviados
- Validar que cantidades recibidas no sean negativas

### Seguridad:
- Requerir confirmación para cantidades diferentes a las enviadas
- Registrar discrepancias en el historial
- Notificar a administración sobre diferencias significativas

## 6. Beneficios para el Negocio

- Mayor precisión en el control de inventario
- Seguimiento detallado de cada producto en traslados
- Identificación rápida de faltantes o dañados
- Mejor control de responsabilidades entre tiendas
- Registro histórico de discrepancias para análisis