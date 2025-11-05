import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const ProductFormModal = ({ product, onClose, onSuccess }) => {
  const { categories, addProduct: storeAddProduct, updateProduct: storeUpdateProduct } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    cost: 0,
    barcode: '',
    unitOfMeasure: 'unidad',
    image: '',
    description: '',
    categoryId: '',
    sku: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        cost: product.cost || 0,
        barcode: product.barcode || '',
        unitOfMeasure: product.unitOfMeasure || 'unidad',
        image: product.image || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        sku: product.sku || ''
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        cost: 0,
        barcode: '',
        unitOfMeasure: 'unidad',
        image: '',
        description: '',
        categoryId: '',
        sku: ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0
    };
    
    try {
      if (product) {
        // Update existing product
        await storeUpdateProduct(product.id, productData);
      } else {
        // Add new product
        await storeAddProduct(productData);
      }
      onSuccess && onSuccess(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-[#282837] rounded-xl border border-[#3a3a4a]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#F0F0F0]">
          {product ? 'Editar Producto' : 'Agregar Producto'}
        </h3>
        <button 
          onClick={onClose}
          className="text-[#a0a0b0] hover:text-[#F0F0F0]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Precio de Venta *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            />
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
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Categoría</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Unidad de Medida</label>
            <select
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
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
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Código de Barras</label>
            <div className="relative">
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-2 focus:border-[#8A2BE2] outline-none"
                placeholder="Escanear o ingresar código"
              />
              <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Imagen URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
              placeholder="URL de la imagen del producto"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none resize-none"
            placeholder="Descripción del producto"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#3a3a4a] text-[#F0F0F0] hover:bg-[#4a4a5a] py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-[#8A2BE2] text-white hover:bg-[#7a1bd2] py-2 px-4 rounded-lg"
          >
            {product ? 'Actualizar Producto' : 'Agregar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormModal;