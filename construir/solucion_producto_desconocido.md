# Solución al Problema de Visualización de Productos

## Análisis del Problema

El problema que estás experimentando donde los productos se muestran como "Producto Desconocido" y "Ubicación Desconocida" en el POS se debe a inconsistencias en los nombres de los campos entre:

1. Los nombres de campos en la base de datos (siguiendo convención snake_case: `product_id`, `location_id`, `category_id`)
2. Los nombres de campos esperados por los componentes de UI (esperando convención camelCase: `productId`, `locationId`, `categoryId`)

## Solución Completa

### 1. Corrección en `ModernPOSPage.jsx`

Actualizar la función `productsForSale` en `ModernPOSPage.jsx` con mapeo correcto de campos:

```javascript
const productsForSale = useMemo(() => {
  const storeId = currentUser?.storeId;
  if (!storeId) return [];

  // Mapear inventario por producto con manejo de ambos formatos de campo
  const stockByProduct = inventoryBatches.reduce((acc, batch) => {
    // Manejar ambos formatos: locationId (camello) y location_id (snake)
    const batchLocationId = batch.locationId || batch.location_id;
    if (batchLocationId === storeId) {
      // Manejar ambos formatos: productId (camello) y product_id (snake)
      const productId = batch.productId || batch.product_id;
      acc[productId] = (acc[productId] || 0) + batch.quantity;
    }
    return acc;
  }, {});

  return productCatalog
    .map(product => ({
      ...product,
      // Mapear campos de categoría asegurando el nombre correcto
      categoryId: product.categoryId || product.category_id,
      // Calcular stock en la ubicación actual
      stockInLocation: stockByProduct[product.id] || 0,
      // Asegurar que el nombre del producto existe
      name: product.name || product.nombre || product.productName || 'Producto sin nombre',
      // Añadir nombre de categoría si es necesario
      categoryName: categories.find(c => 
        c.id === (product.categoryId || product.category_id)
      )?.name || 'Sin categoría'
    }))
    .filter(product => 
      // Manejar ambos formatos para la categoría
      (selectedCategory === '' || 
       product.categoryId === selectedCategory || 
       product.category_id === selectedCategory) &&
      // Manejar búsqueda con múltiples campos de nombre
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (product.barcodes && product.barcodes.some(bc => bc.includes(searchTerm))) ||
       product.barcode?.includes(searchTerm))
    );
}, [productCatalog, inventoryBatches, currentUser, searchTerm, selectedCategory, categories]);
```

### 2. Corrección en `useAppStore.js`

Actualizar la función `loadInventoryBatches` para asegurar consistencia en los nombres de campos:

```javascript
loadInventoryBatches: async () => {
  set({ isLoading: { ...get().isLoading, inventory: true } });
  try {
    if (get().isOnline) {
      const inventoryBatches = await getInventoryBatches();
      
      // Asegurar consistencia en los nombres de campos
      const mappedInventoryBatches = inventoryBatches.map(batch => {
        // Mapear de snake_case a camelCase manteniendo ambos para compatibilidad
        const mapped = {
          ...batch,
          // Campos principales
          inventoryId: batch.id || batch.inventoryId,
          productId: batch.product_id || batch.productId || batch.productId,
          locationId: batch.location_id || batch.locationId || batch.storeId,
          quantity: batch.quantity || 0,
          expirationDate: batch.expiration_date || batch.expirationDate,
          cost: batch.cost || batch.cost || 0,
          // Mantener campos originales para compatibilidad
          product_id: batch.product_id || batch.productId,
          location_id: batch.location_id || batch.locationId,
          expiration_date: batch.expiration_date || batch.expirationDate,
        };
        return mapped;
      });
      
      set({ inventoryBatches: mappedInventoryBatches });
      
      // Guardar en almacenamiento offline
      await Promise.all(mappedInventoryBatches.map(batch => 
        offlineStorage.updateData('inventoryBatches', batch.inventoryId, batch)
      ));
    } else {
      const offlineInventoryBatches = await offlineStorage.getAllData('inventoryBatches');
      // Asegurar consistencia en los datos offline también
      const mappedOfflineBatches = offlineInventoryBatches.map(batch => ({
        ...batch,
        productId: batch.product_id || batch.productId || batch.productId,
        locationId: batch.location_id || batch.locationId || batch.storeId,
        expirationDate: batch.expiration_date || batch.expirationDate,
      }));
      set({ inventoryBatches: mappedOfflineBatches });
    }
  } catch (error) {
    console.error("Error loading inventory batches:", error);
    try {
      const offlineInventoryBatches = await offlineStorage.getAllData('inventoryBatches');
      const mappedOfflineBatches = offlineInventoryBatches.map(batch => ({
        ...batch,
        productId: batch.product_id || batch.productId,
        locationId: batch.location_id || batch.locationId,
        expirationDate: batch.expiration_date || batch.expirationDate,
      }));
      set({ inventoryBatches: mappedOfflineBatches });
    } catch (offlineError) {
      console.error("Error loading inventory batches from offline storage:", offlineError);
    }
  } finally {
    set({ isLoading: { ...get().isLoading, inventory: false } });
  }
},
```

### 3. Actualización del componente `ProductCard`

Asegurar que `ProductCard` maneje ambos formatos de campo:

```jsx
// En ProductCard.tsx, asegurar que los campos se accedan de forma consistente
const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onEdit,
  onQuickAction,
  readOnly = false
}) => {
  // Utilizar un helper para acceder a campos con posibles diferentes nombres
  const getFieldValue = (obj, fieldNames) => {
    for (const field of fieldNames) {
      if (obj[field] !== undefined) {
        return obj[field];
      }
    }
    return null;
  };

  // Obtener valores con manejo de múltiples posibles nombres
  const name = getFieldValue(product, ['name', 'nombre', 'productName']) || 'Producto Desconocido';
  const effectiveStock = product.stockInLocation !== undefined ? product.stockInLocation : (product.stock || 0);
  const categoryId = getFieldValue(product, ['categoryId', 'category_id']);
  const categoryName = getFieldValue(product, ['categoryName', 'category']) || 'Sin Categoría';

  // ... resto del componente con los valores mapeados
};
```

### 4. Actualización de `ProductGrid`

Asegurar que `ProductGrid` pase los datos correctamente:

```jsx
const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onAddToCart,
  onEdit,
  onQuickAction,
  readOnly = false,
  filterByCategory = ''
}) => {
  // Asegurar que los productos tengan campos consistentes
  const normalizedProducts = products.map(product => ({
    ...product,
    name: product.name || product.nombre || 'Producto Desconocido',
    category: product.categoryName || product.category || 'Sin Categoría',
    categoryId: product.categoryId || product.category_id
  }));

  // ... resto del componente
};
```

## Implementación

Para aplicar esta solución:

1. Actualiza la función `productsForSale` en `ModernPOSPage.jsx` con el código proporcionado
2. Actualiza la función `loadInventoryBatches` en `useAppStore.js` con el código proporcionado
3. Si es necesario, actualiza `ProductCard.tsx` y `ProductGrid.tsx` para manejar ambos formatos de campo
4. Reinicia la aplicación para que los cambios tengan efecto

Esto debería resolver el problema de visualización de productos como "Producto Desconocido" y "Ubicación Desconocida", asegurando una correcta correspondencia entre los campos de la base de datos y los componentes de UI.