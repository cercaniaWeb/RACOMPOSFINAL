import React, { useState, useEffect } from 'react';
import { X, Camera, Package, MapPin, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { validateProduct } from './productValidation';

const ProductForm = ({ product, onClose, onSuccess, mode = 'modal', onSave }) => {
  const { 
    categories, 
    stores, 
    addProduct: storeAddProduct, 
    updateProduct: storeUpdateProduct,
    isOnline,
    offlineMode
  } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    cost: 0,
    barcode: '',
    unit: 'unidad',
    image: '',
    description: '',
    categoryId: '',
    sku: '',
    minStockThreshold: {}, // Store min stock by locationId
    tags: [], // Additional tags for the product
    brand: '', // Brand name
    supplierId: '', // Supplier ID
    weight: 0, // Product weight
    dimensions: { length: 0, width: 0, height: 0 }, // Product dimensions
    taxRate: 0, // Tax rate percentage
    isActive: true, // Whether the product is active
    notes: '' // Additional notes
  });

  const [inventoryData, setInventoryData] = useState([]); // Inventory data for each store
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        cost: product.cost || 0,
        barcode: product.barcode || '',
        unit: product.unit || 'unidad',
        image: product.image || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        sku: product.sku || '',
        minStockThreshold: product.minStockThreshold || {},
        tags: product.tags || [],
        brand: product.brand || '',
        supplierId: product.supplierId || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        taxRate: product.taxRate || 0,
        isActive: product.isActive !== undefined ? product.isActive : true,
        notes: product.notes || ''
      });
      
      // Initialize inventory data from existing inventory batches
      if (product.id) {
        const { inventoryBatches } = useAppStore.getState();
        const productInventory = inventoryBatches.filter(batch => batch.productId === product.id);
        
        const inventoryByLocation = stores.map(store => {
          const existingBatch = productInventory.find(batch => batch.locationId === store.id);
          return {
            locationId: store.id,
            quantity: existingBatch ? existingBatch.quantity : 0,
            cost: existingBatch ? existingBatch.cost : 0,
            expirationDate: existingBatch ? existingBatch.expirationDate : '',
            minStock: product.minStockThreshold?.[store.id] || 0
          };
        });
        
        setInventoryData(inventoryByLocation);
      }
    } else {
      setFormData({
        name: '',
        price: 0,
        cost: 0,
        barcode: '',
        unit: 'unidad',
        image: '',
        description: '',
        categoryId: '',
        sku: '',
        minStockThreshold: {},
        tags: [],
        brand: '',
        supplierId: '',
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        taxRate: 0,
        isActive: true,
        notes: ''
      });
      
      // Initialize inventory data with all stores
      const initialInventory = stores.map(store => ({
        locationId: store.id,
        quantity: 0,
        cost: 0,
        expirationDate: '',
        minStock: 0
      }));
      
      setInventoryData(initialInventory);
    }
  }, [product, stores]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle inventory data changes
  const handleInventoryChange = (locationId, field, value) => {
    setInventoryData(prev => 
      prev.map(item => 
        item.locationId === locationId 
          ? { ...item, [field]: field === 'quantity' || field === 'cost' || field === 'minStock' ? parseFloat(value) || 0 : value }
          : item
      )
    );
  };

  // Handle tag input
  const handleTagChange = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validate form data
  const validateForm = () => {
    const validationErrors = validateProduct(formData, inventoryData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        minStockThreshold: inventoryData.reduce((acc, item) => {
          acc[item.locationId] = item.minStock;
          return acc;
        }, {})
      };

      // Add inventory data to product data
      productData.inventoryData = inventoryData;

      if (onSave) {
        await onSave(productData);
      } else if (product) {
        // Update existing product
        await storeUpdateProduct(product.id, productData);
      } else {
        // Add new product
        const result = await storeAddProduct(productData);
        if (!result.success) {
          throw new Error(result.error || 'Error creating product');
        }
      }

      // Handle inventory updates (this would require additional store actions)
      // For now, we'll just call onSuccess to refresh the parent component
      onSuccess && onSuccess(product ? product.id : result.id);
      
      // Show offline warning if applicable
      if (offlineMode) {
        setShowOfflineWarning(true);
        setTimeout(() => setShowOfflineWarning(false), 5000);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the form based on mode (modal or standalone)
  const renderForm = () => (
    <div className={`${mode === 'modal' ? 'p-6' : ''} bg-[#282837] rounded-xl border border-[#3a3a4a]`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-[#F0F0F0]">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </h3>
          {offlineMode && (
            <div className="flex items-center bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
              <WifiOff className="w-3 h-3 mr-1" />
              Modo Offline
            </div>
          )}
          {!isOnline && (
            <div className="flex items-center bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
              <WifiOff className="w-3 h-3 mr-1" />
              Sin conexión
            </div>
          )}
        </div>
        {mode === 'modal' && (
          <button 
            onClick={onClose}
            className="text-[#a0a0b0] hover:text-[#F0F0F0]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Offline Warning */}
      {showOfflineWarning && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="text-yellow-300 text-sm">
            El producto se guardó localmente. Se sincronizará cuando haya conexión.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${
                  errors.name ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors`}
                placeholder="Nombre del producto"
                data-testid="product-name-input"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${
                  errors.sku ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors`}
                placeholder="Código SKU"
                data-testid="product-sku-input"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Código de Barras</label>
              <div className="relative">
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${
                    errors.barcode ? 'border-red-500' : 'border-[#3a3a4a]'
                  } rounded-lg pl-10 pr-4 py-2 focus:border-[#8A2BE2] outline-none transition-colors`}
                  placeholder="Escanear o ingresar código"
                  data-testid="product-barcode-input"
                />
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
              </div>
              {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                Precio de Venta *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${
                  errors.price ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors`}
                data-testid="product-price-input"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${
                  errors.cost ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors`}
                data-testid="product-cost-input"
              />
              {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Categoría</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${
                  errors.categoryId ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors`}
                data-testid="product-category-select"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Unidad de Medida</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                data-testid="product-unit-select"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="gr">Gramo (gr)</option>
                <option value="lb">Libra (lb)</option>
                <option value="oz">Onza (oz)</option>
                <option value="lt">Litro (lt)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="m">Metro (m)</option>
                <option value="cm">Centímetro (cm)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                placeholder="Marca del producto"
                data-testid="product-brand-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Proveedor</label>
              <input
                type="text"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                placeholder="ID o nombre del proveedor"
                data-testid="product-supplier-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Etiquetas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-[#8A2BE2]/20 text-[#8A2BE2] px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-white hover:text-red-400"
                      data-testid={`product-tag-remove-${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={handleTagChange}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                placeholder="Presiona Enter para agregar etiquetas"
                data-testid="product-tags-input"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Imagen URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                placeholder="URL de la imagen del producto"
                data-testid="product-image-input"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                  data-testid="product-weight-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Largo (cm)</label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                  data-testid="product-length-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Ancho (cm)</label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                  data-testid="product-width-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Alto (cm)</label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                  data-testid="product-height-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Tasa de Impuesto (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                  data-testid="product-taxrate-input"
                />
              </div>
              
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#8A2BE2] focus:ring-[#8A2BE2] border-[#3a3a4a] rounded bg-[#1D1D27]"
                  data-testid="product-isactive-checkbox"
                />
                <label className="ml-2 block text-sm text-[#F0F0F0]">
                  Producto Activo
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none resize-none transition-colors"
            placeholder="Descripción detallada del producto"
            data-testid="product-description-textarea"
          ></textarea>
        </div>

        {/* Inventory Management */}
        <div className="border border-[#3a3a4a] rounded-xl p-4">
          <h4 className="text-lg font-semibold text-[#F0F0F0] mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Inventario por Almacén
          </h4>
          
          <div className="space-y-4">
            {inventoryData.map((item, index) => {
              const store = stores.find(s => s.id === item.locationId);
              return (
                <div key={item.locationId} className="border border-[#3a3a4a] rounded-lg p-4" data-testid={`inventory-item-${item.locationId}`}>
                  <div className="flex items-center mb-3">
                    <MapPin className="w-4 h-4 text-[#a0a0b0] mr-2" />
                    <h5 className="font-medium text-[#F0F0F0]">{store?.name || 'Almacén'}</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleInventoryChange(item.locationId, 'quantity', e.target.value)}
                        min="0"
                        className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                        data-testid={`inventory-quantity-input-${item.locationId}`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo Unitario</label>
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleInventoryChange(item.locationId, 'cost', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                        data-testid={`inventory-cost-input-${item.locationId}`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Stock Mínimo</label>
                      <input
                        type="number"
                        value={item.minStock}
                        onChange={(e) => handleInventoryChange(item.locationId, 'minStock', e.target.value)}
                        min="0"
                        className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                        data-testid={`inventory-minstock-input-${item.locationId}`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Fecha de Vencimiento</label>
                      <input
                        type="date"
                        value={item.expirationDate}
                        onChange={(e) => handleInventoryChange(item.locationId, 'expirationDate', e.target.value)}
                        className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                        data-testid={`inventory-expiration-date-input-${item.locationId}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Notas Adicionales</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none resize-none transition-colors"
            placeholder="Notas adicionales sobre el producto"
            data-testid="product-notes-textarea"
          ></textarea>
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-300">{errors.submit}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#3a3a4a] text-[#F0F0F0] hover:bg-[#4a4a5a] py-2 px-4 rounded-lg transition-colors"
            data-testid="cancel-product-form-button"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#8A2BE2] text-white hover:bg-[#7a1bd2] py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            data-testid="submit-product-form-button"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              `${product ? 'Actualizar' : 'Agregar'} Producto`
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {renderForm()}
        </div>
      </div>
    );
  }

  return renderForm();
};

export default ProductForm;