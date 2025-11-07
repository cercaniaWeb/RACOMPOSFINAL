import React, { useState, useEffect, useCallback } from 'react';
import { X, Scale, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import scaleService from '../services/ScaleService';

const WeightModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const { currentUser, inventoryBatches } = useAppStore();
  const [weight, setWeight] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [error, setError] = useState('');
  const [scaleStatus, setScaleStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [scaleStatusMessage, setScaleStatusMessage] = useState('Balanza no conectada');
  const [isScaleAvailable, setIsScaleAvailable] = useState(false);
  const [autoUpdateWeight, setAutoUpdateWeight] = useState(false);

  // Check if Web APIs are available
  useEffect(() => {
    const webSerialAvailable = 'serial' in navigator;
    const webBluetoothAvailable = 'bluetooth' in navigator;
    
    setIsScaleAvailable(webSerialAvailable || webBluetoothAvailable);
  }, []);

  // Calculate available stock for the current store
  const availableStock = inventoryBatches
    .filter(batch => 
      product?.id && batch?.productId === product.id && 
      currentUser?.storeId && batch?.locationId === currentUser.storeId
    )
    .reduce((sum, batch) => sum + (batch?.quantity || 0), 0);

  // Calculate price in real-time as weight changes
  useEffect(() => {
    if (product && weight && !isNaN(weight) && weight > 0) {
      const numericWeight = parseFloat(weight);
      if (product && numericWeight > availableStock) {
        setError(`Stock insuficiente. Disponible: ${availableStock.toFixed(3)} ${product.unit || 'kg'}`);
      } else if (numericWeight <= 0) {
        setError('El peso debe ser mayor a 0');
      } else {
        setError('');
        if (product?.price) {
          const price = numericWeight * product.price;
          setCalculatedPrice(price);
        }
      }
    } else {
      setCalculatedPrice(0);
      setError('');
    }
  }, [weight, product, availableStock]);

  // Handle scale connection status updates
  useEffect(() => {
    if (!isOpen) return;

    const handleStatusChange = (status, message) => {
      setScaleStatus(status);
      setScaleStatusMessage(message);
    };

    scaleService.addStatusListener(handleStatusChange);

    // Initialize scale if not already connected
    if (!scaleService.isConnected) {
      // Try to connect to simulated scale by default for development
      const connectToScale = async () => {
        try {
          await scaleService.connect('simulate');
        } catch (error) {
          console.error('No se pudo conectar a la balanza simulada:', error);
        }
      };
      connectToScale();
    }

    return () => {
      scaleService.removeStatusListener(handleStatusChange);
    };
  }, [isOpen]);

  // Handle weight updates from scale
  useEffect(() => {
    if (!isOpen || !autoUpdateWeight) return;

    const handleWeightChange = (weight, unit) => {
      if (unit === product?.unit || !product?.unit || product?.unit === 'kg') {
        setWeight(weight.toFixed(3));
      }
    };

    scaleService.addWeightListener(handleWeightChange);

    return () => {
      scaleService.removeWeightListener(handleWeightChange);
    };
  }, [isOpen, autoUpdateWeight, product?.unit]);

  const handleAddToCart = () => {
    if (!error && weight && parseFloat(weight) > 0) {
      // Call the function passed from the parent to add the product to cart
      if (parseFloat(weight) > 0) {
        onAddToCart(parseFloat(weight));
      }
      onClose();
    }
  };

  const connectToScale = useCallback(async () => {
    try {
      setScaleStatus('connecting');
      setScaleStatusMessage('Conectando a la balanza...');
      
      // For this example, we'll use simulation mode
      // In a real implementation, this would use actual connection type
      await scaleService.connect('simulate');
      setScaleStatus('connected');
      setScaleStatusMessage('Balanza conectada');
    } catch (error) {
      setScaleStatus('error');
      setScaleStatusMessage(`Conexión fallida: ${error.message}`);
    }
  }, []);

  const disconnectFromScale = useCallback(async () => {
    try {
      await scaleService.disconnect();
      setAutoUpdateWeight(false);
      setScaleStatus('disconnected');
      setScaleStatusMessage('Balanza desconectada');
    } catch (error) {
      console.error('Error al desconectar la balanza:', error);
    }
  }, []);

  const toggleAutoUpdate = useCallback(() => {
    setAutoUpdateWeight(!autoUpdateWeight);
  }, [autoUpdateWeight]);

  const useCurrentScaleReading = useCallback(() => {
    const { weight: scaleWeight, unit, isConnected } = scaleService.getCurrentWeight();
    if (isConnected && unit === (product?.unit || 'kg')) {
      setWeight(scaleWeight.toFixed(3));
    }
  }, [product?.unit]);

  // Don't try to render if product is null to prevent errors
  if (!isOpen || !product || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#F0F0F0]">Pesar Producto</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${
              scaleStatus === 'connected' 
                ? 'text-green-500' 
                : scaleStatus === 'error' 
                  ? 'text-red-500' 
                  : 'text-yellow-500'
            }`}>
              {isScaleAvailable ? (
                <Wifi className={`w-4 h-4 ${
                  scaleStatus === 'connected' 
                    ? 'text-green-500' 
                    : scaleStatus === 'error' 
                      ? 'text-red-500' 
                      : 'text-yellow-500'
                }`} />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-500" />
              )}
              <span className="ml-1 text-xs">{scaleStatus}</span>
            </div>
            <button 
              onClick={onClose}
              className="text-[#a0a0b0] hover:text-[#F0F0F0]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-[#3a3a4a] rounded-lg flex items-center justify-center">
              {product?.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded" />
              ) : (
                <span className="text-[#a0a0b0] text-xs">No imagen</span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-[#F0F0F0]">{product?.name || 'Producto'}</h4>
              <p className="text-[#a0a0b0] text-sm">${product?.price?.toFixed(2)} / {product?.unit || 'kg'}</p>
            </div>
          </div>

          {/* Scale Controls */}
          <div className="mb-4 p-3 bg-[#1D1D27] rounded-lg border border-[#3a3a4a]">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#F0F0F0] text-sm">Conexión de Balanza</h4>
              <div className="flex space-x-2">
                {scaleService.isConnected ? (
                  <button 
                    onClick={disconnectFromScale}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    Desconectar
                  </button>
                ) : (
                  <button 
                    onClick={connectToScale}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    Conectar
                  </button>
                )}
              </div>
            </div>
            <div className="text-xs text-[#a0a0b0] mb-3">{scaleStatusMessage}</div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleAutoUpdate}
                disabled={!scaleService.isConnected}
                className={`text-xs px-2 py-1 rounded ${
                  autoUpdateWeight 
                    ? 'bg-green-600 text-white' 
                    : !scaleService.isConnected 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#8A2BE2] text-white hover:bg-purple-700'
                }`}
              >
                {autoUpdateWeight ? 'Actualizar automático ON' : 'Actualizar automático OFF'}
              </button>
              
              <button
                onClick={useCurrentScaleReading}
                disabled={!scaleService.isConnected}
                className={`text-xs px-2 py-1 rounded flex items-center ${
                  !scaleService.isConnected 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#8A2BE2] text-white hover:bg-purple-700'
                }`}
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Usar lectura
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#a0a0b0] mb-2">Cantidad ({product?.unit || 'kg'})</label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  // If user manually changes the weight, turn off auto-update
                  if (autoUpdateWeight) {
                    setAutoUpdateWeight(false);
                  }
                }}
                className={`w-full bg-[#1D1D27] text-[#F0F0F0] border rounded-lg px-3 py-3 focus:border-[#8A2BE2] outline-none transition-colors ${
                  error ? 'border-red-500' : 'border-[#3a3a4a]'
                }`}
                placeholder={`Ingrese ${product?.unit || 'kg'}`}
                autoFocus
                disabled={autoUpdateWeight} // Disable if auto-update is on
              />
              {scaleService.isConnected && (
                <div className="absolute right-3 top-3 text-xs text-[#8A2BE2]">
                  {scaleService.getCurrentWeight().weight} {product?.unit || 'kg'}
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <p className="text-[#a0a0b0] text-sm mt-1">Disponible: {availableStock.toFixed(3)} {product?.unit || 'kg'}</p>
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

// Error boundary class component
class WeightModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('WeightModal error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when there's an error
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#F0F0F0]">Pesar Producto</h3>
            </div>
            <div className="text-center py-8">
              <p className="text-[#F0F0F0] mb-4">Error al cargar el panel de peso</p>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render the actual component when there's no error
    return <WeightModal {...this.props} />;
  }
}

export default WeightModalErrorBoundary;