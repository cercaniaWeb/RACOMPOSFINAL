import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TransferFormModal = ({ onClose, currentUser }) => {
  const { products, stores, createTransferRequest } = useAppStore();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    destinationStoreId: '',
    comment: ''
  });

  const handleAddProduct = (product) => {
    if (!selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity: parseInt(quantity) || 1 } : p
    ));
  };

  const handleSubmit = () => {
    if (selectedProducts.length === 0) {
      alert('Debe seleccionar al menos un producto');
      return;
    }
    
    if (!formData.destinationStoreId) {
      alert('Debe seleccionar una tienda de destino');
      return;
    }

    const transferItems = selectedProducts.map(p => ({
      productId: p.id,
      productName: p.name,
      requestedQuantity: p.quantity
    }));

    // Crear la solicitud de traslado
    createTransferRequest({
      items: transferItems
    });

    onClose();
  };

  const filteredStores = stores.filter(store => store.id !== currentUser?.storeId);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="destinationStoreId" className="block text-sm font-medium text-gray-700">Tienda de Destino</label>
        <select
          id="destinationStoreId"
          name="destinationStoreId"
          value={formData.destinationStoreId}
          onChange={(e) => setFormData({...formData, destinationStoreId: e.target.value})}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-black"
        >
          <option value="">Selecciona una tienda</option>
          {filteredStores.map(store => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h3 className="text-lg font-medium mb-2">Buscar Producto</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-white text-black border border-gray-300 rounded-lg pl-4 pr-4 py-2 focus:border-indigo-500 focus:outline-none"
            onChange={(e) => {}}
          />
        </div>

        <h3 className="text-lg font-medium mb-2">Productos Disponibles</h3>
        <div className="max-h-40 overflow-y-auto border rounded p-2">
          {products.slice(0, 5).map(product => (
            <div key={product.id} className="flex justify-between items-center p-2 border-b">
              <span>{product.name}</span>
              <button
                onClick={() => handleAddProduct(product)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h3 className="text-lg font-medium mb-2">Productos para Traslado</h3>
        {selectedProducts.length === 0 ? (
          <p className="text-gray-500">No hay productos seleccionados</p>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map(product => (
              <div key={product.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{product.name}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-black"
                  />
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Crear Solicitud
        </Button>
      </div>
    </div>
  );
};

export default TransferFormModal;