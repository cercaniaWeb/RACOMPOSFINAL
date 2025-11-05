import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const InventoryBatchFormModal = ({ batch, onClose }) => {
  const { products, stores, addInventoryBatch, updateInventoryBatch } = useAppStore();
  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    quantity: 0,
    cost: 0,
    expirationDate: '',
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        productId: batch.productId || '',
        locationId: batch.locationId || '',
        quantity: batch.quantity || 0,
        cost: batch.cost || 0,
        expirationDate: batch.expirationDate || '',
      });
    } else {
      setFormData({
        productId: '',
        locationId: '',
        quantity: 0,
        cost: 0,
        expirationDate: '',
      });
    }
  }, [batch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (batch) {
        // Update existing batch
        await updateInventoryBatch(batch.id, formData);
      } else {
        // Add new batch
        await addInventoryBatch(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving inventory batch:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Producto</label>
        <select
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-black"
        >
          <option value="">Selecciona un producto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">Ubicación</label>
        <select
          id="locationId"
          name="locationId"
          value={formData.locationId}
          onChange={handleChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-black"
        >
          <option value="">Selecciona una ubicación</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          required
          min="0"
        />
      </div>

      <div>
        <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Costo por unidad</label>
        <Input
          id="cost"
          name="cost"
          type="number"
          value={formData.cost}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Fecha de Vencimiento (Opcional)</label>
        <Input
          id="expirationDate"
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {batch ? "Actualizar Lote" : "Agregar Lote"}
        </Button>
      </div>
    </form>
  );
};

export default InventoryBatchFormModal;