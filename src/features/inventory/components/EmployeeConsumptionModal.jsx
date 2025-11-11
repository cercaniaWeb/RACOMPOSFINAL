import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import useAppStore from '../../../store/useAppStore';
import useNotification from '../../../features/notifications/hooks/useNotification';

const EmployeeConsumptionModal = ({ onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const { products, recordEmployeeConsumption } = useAppStore();
  const { showSuccess, showError } = useNotification();

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      setErrors({ product: 'Debes seleccionar un producto.' });
      showError('Debes seleccionar un producto.');
      return;
    }
    if (quantity <= 0) {
      setErrors({ quantity: 'La cantidad debe ser mayor a cero.' });
      showError('La cantidad debe ser mayor a cero.');
      return;
    }
    if (quantity > selectedProduct.stock) {
      setErrors({ quantity: `La cantidad no puede ser mayor al stock disponible (${selectedProduct.stock}).` });
      showError(`La cantidad no puede ser mayor al stock disponible (${selectedProduct.stock}).`);
      return;
    }

    recordEmployeeConsumption(selectedProduct.id, quantity);
    showSuccess(`Se registró el consumo de ${quantity} ${selectedProduct.name}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#F0F0F0]">Consumo de Empleados</h3>
          <button onClick={onClose} className="text-[#a0a0b0] hover:text-[#F0F0F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Producto</label>
            <select
              onChange={(e) => handleProductSelect(e.target.value)}
              className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${errors.product ? 'border-red-500' : 'border-[#3a3a4a]'} rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none`}
            >
              <option value="">Selecciona un producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            {errors.product && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.product}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div>
              <p className="text-sm text-[#a0a0b0]">Costo Promedio Ponderado (CPP): ${selectedProduct.cpp.toFixed(2)}</p>
              <p className="text-sm text-[#a0a0b0]">Stock disponible: {selectedProduct.stock}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Cantidad</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              min="1"
              className={`w-full bg-[#1D1D27] text-[#F0F0F0] border ${errors.quantity ? 'border-red-500' : 'border-[#3a3a4a]'} rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none`}
            />
            {errors.quantity && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.quantity}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-[#3a3a4a] hover:bg-[#4a4a5a] text-[#F0F0F0] py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
          >
            Registrar Consumo
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeConsumptionModal;
