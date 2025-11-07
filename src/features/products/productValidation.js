/**
 * Validates product form data
 * @param {Object} formData - Product form data
 * @param {Array} inventoryData - Inventory data for each location
 * @returns {Object} - Validation errors
 */
export const validateProduct = (formData, inventoryData) => {
  const errors = {};

  // Validate required fields
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'El nombre del producto es obligatorio';
  } else if (formData.name.length > 200) {
    errors.name = 'El nombre del producto debe tener máximo 200 caracteres';
  }

  if (formData.price === null || formData.price === undefined || isNaN(formData.price) || formData.price < 0) {
    errors.price = 'El precio debe ser un número positivo';
  } else if (formData.price > 999999999) {
    errors.price = 'El precio es demasiado alto';
  }

  if (formData.cost < 0) {
    errors.cost = 'El costo debe ser un número positivo';
  } else if (formData.cost > 999999999) {
    errors.cost = 'El costo es demasiado alto';
  }

  if (formData.cost > formData.price) {
    errors.cost = 'El costo no puede ser mayor que el precio de venta';
  }

  if (formData.sku && formData.sku.length > 100) {
    errors.sku = 'El SKU debe tener máximo 100 caracteres';
  }

  if (formData.barcode && formData.barcode.length > 50) {
    errors.barcode = 'El código de barras debe tener máximo 50 caracteres';
  }

  if (formData.description && formData.description.length > 1000) {
    errors.description = 'La descripción debe tener máximo 1000 caracteres';
  }

  if (formData.brand && formData.brand.length > 100) {
    errors.brand = 'La marca debe tener máximo 100 caracteres';
  }

  if (formData.supplierId && formData.supplierId.length > 100) {
    errors.supplierId = 'El ID del proveedor debe tener máximo 100 caracteres';
  }

  if (formData.weight < 0) {
    errors.weight = 'El peso debe ser un número positivo';
  }

  if (formData.taxRate < 0 || formData.taxRate > 100) {
    errors.taxRate = 'La tasa de impuesto debe estar entre 0 y 100';
  }

  // Validate dimensions
  if (formData.dimensions.length < 0) {
    errors.dimensions = 'La longitud debe ser un número positivo';
  }
  if (formData.dimensions.width < 0) {
    errors.dimensions = 'El ancho debe ser un número positivo';
  }
  if (formData.dimensions.height < 0) {
    errors.dimensions = 'La altura debe ser un número positivo';
  }

  // Validate inventory data
  if (!inventoryData || !Array.isArray(inventoryData)) {
    errors.inventory = 'Datos de inventario inválidos';
  } else {
    // Check for duplicate location IDs
    const locationIds = inventoryData.map(item => item.locationId);
    const uniqueLocationIds = [...new Set(locationIds)];
    if (locationIds.length !== uniqueLocationIds.length) {
      errors.inventory = 'No se pueden tener múltiples entradas para el mismo almacén';
    }

    // Validate each inventory item
    inventoryData.forEach((item, index) => {
      if (item.quantity < 0) {
        errors[`inventory-${index}`] = `La cantidad en el almacén ${item.locationId} debe ser positiva`;
      }
      if (item.cost < 0) {
        errors[`inventory-${index}-cost`] = `El costo en el almacén ${item.locationId} debe ser positivo`;
      }
      if (item.minStock < 0) {
        errors[`inventory-${index}-minStock`] = `El stock mínimo en el almacén ${item.locationId} debe ser positivo`;
      }
      if (item.expirationDate && item.expirationDate !== '' && new Date(item.expirationDate) < new Date()) {
        errors[`inventory-${index}-expiration`] = `La fecha de vencimiento en el almacén ${item.locationId} no puede ser en el pasado`;
      }
    });
  }

  // Validate tags
  if (formData.tags && formData.tags.length > 20) {
    errors.tags = 'No se pueden agregar más de 20 etiquetas';
  }
  if (formData.tags && formData.tags.some(tag => tag.length > 50)) {
    errors.tags = 'Cada etiqueta debe tener máximo 50 caracteres';
  }

  return errors;
};

/**
 * Validates a single inventory batch
 * @param {Object} batch - Inventory batch data
 * @returns {Object} - Validation errors
 */
export const validateInventoryBatch = (batch) => {
  const errors = {};

  if (batch.quantity < 0) {
    errors.quantity = 'La cantidad debe ser un número positivo';
  }

  if (batch.cost < 0) {
    errors.cost = 'El costo debe ser un número positivo';
  }

  if (batch.minStock < 0) {
    errors.minStock = 'El stock mínimo debe ser un número positivo';
  }

  if (batch.expirationDate && new Date(batch.expirationDate) < new Date()) {
    errors.expirationDate = 'La fecha de vencimiento no puede ser en el pasado';
  }

  return errors;
};