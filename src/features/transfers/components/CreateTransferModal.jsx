import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import useAppStore from '../../../store/useAppStore';
import useNotification from '../../../features/notifications/hooks/useNotification';

const CreateTransferModal = ({ onClose }) => {
  const { stores, products, createTransfer } = useAppStore();
  const { showSuccess, showError } = useNotification();
  const [originLocationId, setOriginLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      showError('Por favor, selecciona un producto y una cantidad válida.');
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      showError('Producto no encontrado.');
      return;
    }
    setItems([...items, { productId: product.id, productName: product.name, requestedQuantity: quantity }]);
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const handleSubmit = () => {
    if (!originLocationId || !destinationLocationId || items.length === 0) {
      showError('Por favor, completa todos los campos y agrega al menos un producto.');
      return;
    }
    if (originLocationId === destinationLocationId) {
      showError('El origen y el destino no pueden ser iguales.');
      return;
    }

    createTransfer({ originLocationId, destinationLocationId, items });
    showSuccess('Orden de traslado creada exitosamente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#F0F0F0]">Crear Orden de Traslado</h3>
          <button onClick={onClose} className="text-[#a0a0b0] hover:text-[#F0F0F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Origen</label>
              <select
                value={originLocationId}
                onChange={(e) => setOriginLocationId(e.target.value)}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
              >
                <option value="">Selecciona un origen</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Destino</label>
              <select
                value={destinationLocationId}
                onChange={(e) => setDestinationLocationId(e.target.value)}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
              >
                <option value="">Selecciona un destino</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-[#3a3a4a] pt-4">
            <h4 className="text-lg font-medium text-[#F0F0F0] mb-2">Artículos</h4>
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Producto</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Cantidad</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : 1;
                    setQuantity(isNaN(value) ? 1 : value);
                  }}
                  min="1"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                />
              </div>
              <button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {items.map(item => (
                <div key={item.productId} className="flex items-center justify-between bg-[#1D1D27] p-2 rounded-lg">
                  <span className="text-[#F0F0F0]">{item.productName} (x{item.requestedQuantity})</span>
                  <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="bg-[#3a3a4a] hover:bg-[#4a4a5a] text-[#F0F0F0] py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
          >
            Crear Traslado
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTransferModal;
