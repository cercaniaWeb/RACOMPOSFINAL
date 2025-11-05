import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const WeightModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const { currentUser, inventoryBatches } = useAppStore();
  const [weight, setWeight] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [error, setError] = useState('');

  // Calculate available stock for the current store
  const availableStock = inventoryBatches
    .filter(batch => 
      batch?.productId === product?.id && 
      batch?.locationId === currentUser?.storeId
    )
    .reduce((sum, batch) => sum + (batch?.quantity || 0), 0);

  // Calculate price in real-time as weight changes
  useEffect(() => {
    if (weight && !isNaN(weight) && weight > 0) {
      const numericWeight = parseFloat(weight);
      if (numericWeight > availableStock) {
        setError(`Stock insuficiente. Disponible: ${availableStock.toFixed(3)} ${product.unit || 'kg'}`);
      } else if (numericWeight <= 0) {
        setError('El peso debe ser mayor a 0');
      } else {
        setError('');
        const price = numericWeight * product.price;
        setCalculatedPrice(price);
      }
    } else {
      setCalculatedPrice(0);
      setError('');
    }
  }, [weight, product, availableStock]);

  const handleAddToCart = () => {
    if (!error && weight && parseFloat(weight) > 0) {
      // Call the function passed from the parent to add the product to cart
      if (parseFloat(weight) > 0) {
        onAddToCart(parseFloat(weight));
      }
      onClose();
    }
  };

  if (!isOpen || !product || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#F0F0F0]">Pesar Producto</h3>
          <button 
            onClick={onClose}
            className="text-[#a0a0b0] hover:text-[#F0F0F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-[#3a3a4a] rounded-lg flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded" />
              ) : (
                <span className="text-[#a0a0b0] text-xs">No imagen</span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-[#F0F0F0]">{product.name}</h4>
              <p className="text-[#a0a0b0] text-sm">${product.price?.toFixed(2)} / {product.unit || 'kg'}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#a0a0b0] mb-2">Cantidad ({product.unit || 'kg'})</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-full bg-[#1D1D27] text-[#F0F0F0] border rounded-lg px-3 py-3 focus:border-[#8A2BE2] outline-none transition-colors ${
                error ? 'border-red-500' : 'border-[#3a3a4a]'
              }`}
              placeholder={`Ingrese ${product.unit || 'kg'}`}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <p className="text-[#a0a0b0] text-sm mt-1">Disponible: {availableStock.toFixed(3)} {product.unit || 'kg'}</p>
          </div>

          <div className="bg-[#1D1D27] rounded-lg p-4 border border-[#3a3a4a]">
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Precio Total:</span>
              <span className="text-[#8A2BE2] font-bold text-lg">${calculatedPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1D1D27] hover:bg-[#3a3a4a] text-[#F0F0F0] py-3 rounded-lg border border-[#3a3a4a] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!!error || !weight || parseFloat(weight) <= 0}
            className={`flex-1 py-3 rounded-lg transition-colors ${
              error || !weight || parseFloat(weight) <= 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-[#8A2BE2] hover:bg-purple-700 text-white'
            }`}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeightModal;