import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Printer,
  FileText,
  Search,
  Package,
  CreditCard,
  UserCircle,
  Zap,
  Percent,
  Calendar,
  X,
  Scan,
  Calculator,
  Maximize,
  Scale,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import useAppStore from '../store/useAppStore';
import Ticket from '../features/pos/Ticket';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useZxing } from 'react-zxing';

import EmployeeConsumptionModal from '../features/pos/EmployeeConsumptionModal';
import CalculatorModal from '../features/pos/CalculatorModal';
import TicketDesignModal from '../features/pos/TicketDesignModal';
import DiscountModal from '../features/pos/DiscountModal';
import NoteModal from '../features/pos/NoteModal';
import PaymentModal from '../features/pos/PaymentModal';
import CashClosingModal from '../features/pos/CashClosingModal';
import ProductFormModal from '../features/products/ProductFormModal';
import PreviousSalesModal from '../features/pos/PreviousSalesModal';
import ScheduleVisitModal from '../features/pos/ScheduleVisitModal';
import WithdrawalModal from '../features/pos/WithdrawalModal';
import ProductCollectionModal from '../features/pos/ProductCollectionModal';
import ScannerComponent from '../components/qr/ScannerComponent';
import WeightModal from '../components/WeightModal';
import scaleService from '../services/ScaleService';
import useNotification from '../features/notifications/hooks/useNotification';





export default function POSPage() {
  const {
    currentUser,
    cart,
    searchTerm = '',
    setSearchTerm,
    categories,
    products: productCatalog,
    inventoryBatches,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleCheckout,
    lastSale,
    darkMode,
    isOnline,
    offlineMode,
    isWeightModalOpen,
    weighingProduct,
    openWeightModal,
    closeWeightModal,
    addToCartWithWeight,
  } = useAppStore();

  const [isScanning, setIsScanning] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEmployeeConsumptionModalOpen, setIsEmployeeConsumptionModalOpen] = useState(false);
  const [isTicketDesignModalOpen, setIsTicketDesignModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isCashClosingModalOpen, setIsCashClosingModalOpen] = useState(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [isPreviousSalesModalOpen, setIsPreviousSalesModalOpen] = useState(false);
  const [isScheduleVisitModalOpen, setIsScheduleVisitModalOpen] = useState(false);
  const [postPaymentModalOpen, setPostPaymentModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isProductCollectionModalOpen, setIsProductCollectionModalOpen] = useState(false);
  
  // Scale status state
  const [scaleStatus, setScaleStatus] = useState('disconnected');
  const [scaleStatusMessage, setScaleStatusMessage] = useState('Scale not connected');

  // Initialize scale status
  useEffect(() => {
    const handleStatusChange = (status, message) => {
      setScaleStatus(status);
      setScaleStatusMessage(message);
    };

    scaleService.addStatusListener(handleStatusChange);

    // Initialize scale status
    if (scaleService.isConnected) {
      setScaleStatus('connected');
      setScaleStatusMessage('Balanza conectada');
    } else {
      setScaleStatus('disconnected');
      setScaleStatusMessage('Balanza no conectada');
    }

    return () => {
      scaleService.removeStatusListener(handleStatusChange);
    };
  }, []);

  const ticketRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket_Venta_${lastSale?.saleId}`,
  });

  const handleSaveTicket = async () => {
    const element = ticketRef.current;
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ticket_venta_${lastSale?.saleId}.pdf`);
    }
    setPostPaymentModalOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const productsForSale = useMemo(() => {
    const storeId = currentUser?.storeId || '1'; // Usar tienda 1 por defecto para fines de prueba
    if (!storeId) {
      console.log("No store ID for current user");
      // Aún así devolver productos para que se muestren en la interfaz
      return productCatalog.map(product => ({
        ...product,
        stockInLocation: process.env.NODE_ENV === 'development' ? 50 : 0, // Stock temporal en desarrollo
        name: product.name || product.nombre || product.productName || 'Producto sin nombre',
        categoryName: categories.find(c => 
          c.id === (product.categoryId || product.category_id)
        )?.name || 'Sin categoría'
      }));
    }

    console.log("storeId:", storeId);
    console.log("inventoryBatches:", inventoryBatches);
    console.log("productCatalog length:", productCatalog.length);

    // Mapear inventario por producto con manejo de ambos formatos de campo
    const stockByProduct = inventoryBatches.reduce((acc, batch) => {
      // Manejar ambos formatos: locationId (camelCase) y location_id (snake_case)
      const batchLocationId = batch.locationId || batch.location_id;
      
      // Asegurarse de que la comparación sea consistente con tipos de datos
      if (String(batchLocationId) === String(storeId)) {
        // Manejar ambos formatos: productId (camelCase) y product_id (snake_case)
        const productId = batch.productId || batch.product_id;
        
        // Debug: mostrar detalles de cada batch
        console.log("Batch location match:", {
          batchLocationId,
          storeId,
          productId,
          quantity: batch.quantity
        });
        
        // Asegurar tipo cadena para la clave del objeto
        acc[String(productId)] = (acc[String(productId)] || 0) + batch.quantity;
      }
      return acc;
    }, {});

    console.log("stockByProduct:", stockByProduct);
    console.log("Products in catalog:", productCatalog.map(p => ({ id: p.id, name: p.name })));

    // Mapear productos del catálogo con información adicional
    let allCatalogProducts = productCatalog
      .map(product => {
        const calculatedStock = stockByProduct[String(product.id)] || 0;
        return {
          ...product,
          // Mapear campos de categoría asegurando el nombre correcto
          categoryId: product.categoryId || product.category_id,
          // Calcular stock en la ubicación actual (asegurar string para comparación)
          stockInLocation: calculatedStock > 0 ? calculatedStock : (process.env.NODE_ENV === 'development' ? 50 : 0),
          // Asegurar que el nombre del producto existe
          name: product.name || product.nombre || product.productName || 'Producto sin nombre',
          // Añadir nombre de categoría si es necesario
          categoryName: categories.find(c => 
            c.id === (product.categoryId || product.category_id)
          )?.name || 'Sin categoría'
        };
      });

    console.log("allCatalogProducts count:", allCatalogProducts.length);

    // Si no hay productos en el catálogo, mostrar todos los productos disponibles en el store
    if (allCatalogProducts.length === 0) {
      console.log("No products in catalog, showing all available products");
      // En lugar de crear productos de ejemplo aquí, usar los productos del catálogo general
      allCatalogProducts = productCatalog.map(product => ({
        ...product,
        stockInLocation: process.env.NODE_ENV === 'development' ? 50 : 0, // Stock temporal en desarrollo
        name: product.name || product.nombre || product.productName || 'Producto sin nombre',
        categoryName: categories.find(c => 
          c.id === (product.categoryId || product.category_id)
        )?.name || 'Sin categoría'
      }));
    }

    // Filtrar productos según la búsqueda (asegurar strings para la comparación)
    const productsToShow = allCatalogProducts.filter(product => 
      // Manejar búsqueda con múltiples campos de nombre
      (String(product.name).toLowerCase().includes(String(searchTerm).toLowerCase()) ||
       String(product.nombre || '').toLowerCase().includes(String(searchTerm).toLowerCase()) ||
       String(product.productName || '').toLowerCase().includes(String(searchTerm).toLowerCase()) ||
       String(product.description || '').toLowerCase().includes(String(searchTerm).toLowerCase()))
    );

    console.log("productsToShow count:", productsToShow.length);
    
    return productsToShow;
  }, [productCatalog, inventoryBatches, currentUser, searchTerm, categories]);

  // Show notification when going offline
  React.useEffect(() => {
    const handleOnline = () => {
      alert('Conexión restaurada. Los datos se sincronizarán automáticamente.');
    };

    const handleOffline = () => {
      alert('Sin conexión a Internet. La aplicación está trabajando en modo sin conexión.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleScanning = () => setIsScanning(prev => !prev);

  const handleScan = (scannedBarcode) => {
    if (!scannedBarcode || scannedBarcode.trim() === '') return;
    const product = productsForSale.find(p => p.barcode === scannedBarcode);
    if (product) {
      addToCart(product);
      showSuccess(`${product.name} agregado al carrito.`);
    } else {
      showError(`Producto con código ${scannedBarcode} no encontrado.`);
    }
    setIsScanning(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (productId, e) => {
    const quantity = parseInt(e.target.value, 10);
    updateCartItemQuantity(productId, quantity);
  };

  const handleCheckoutClick = () => {
    setIsPaymentMethodModalOpen(true);
  };

  const handlePaymentSuccess = async (payment) => {
    const result = await handleCheckout(payment);
    
    // Handle offline mode result
    if (result.offline) {
      // Show a special message for offline transactions
      alert('Venta procesada en modo sin conexión. Se sincronizará cuando haya conexión a Internet.');
    }
    
    setIsPaymentMethodModalOpen(false);
    setPostPaymentModalOpen(true); // Open post-payment options modal
  };

  const canAccessEmployeeConsumption = currentUser && (currentUser.role === 'admin' || currentUser.role === 'gerente');

  return (
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 bg-[#1D1D27] overflow-hidden h-full">
        <div className="w-full md:w-2/3 flex flex-col gap-3 min-h-0 flex-1">
          <header className="flex justify-between items-center text-[#f5f5f5] flex-shrink-0 pb-1">
            <div>
              <h1 className="text-lg font-bold text-[#F0F0F0]">Punto de Venta</h1>
              <p className="text-xs text-[#a0a0b0]">Tienda: {currentUser?.storeName || 'Principal'}</p>
              {offlineMode && (
                <div className="flex items-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#ff5252] rounded-full mr-1.5"></div>
                  <span className="text-[0.5rem] text-[#ff5252] font-medium">Modo Sin Conexión</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1.5">
              {!isOnline && (
                <div className="flex items-center bg-[#ffab00]/20 text-[#ffab00] px-1.5 py-0.5 rounded text-[0.5rem] font-medium border border-[#ffab00]/30">
                  <Zap size={10} className="mr-1" />
                  <span>Sin conexión</span>
                </div>
              )}

              {/* Scale Status Indicator */}
              <div className={`flex items-center px-1.5 py-0.5 rounded text-[0.5rem] font-medium border ${
                scaleStatus === 'connected' 
                  ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                  : scaleStatus === 'error' 
                    ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                    : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
              }`}>
                {scaleStatus === 'connected' ? <Wifi size={10} className="mr-1" /> : <WifiOff size={10} className="mr-1" />}
                <span>Balance: {scaleStatus}</span>
              </div>

              <Button onClick={toggleFullscreen} variant="outline" className="p-1">
                <Maximize size={14} />
              </Button>
            </div>
          </header>

          <div className="bg-[#282837] rounded-lg border border-[#3a3a4a] flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-hidden min-h-0">
              <table className="w-full h-full">
                <thead className="flex-shrink-0">
                  <tr className="border-b border-[#3a3a4a]">
                    <th className="py-2 px-3 text-left text-[#a0a0b0] text-[0.7rem] font-semibold uppercase tracking-wider">Cantidad</th>
                    <th className="py-2 px-3 text-left text-[#a0a0b0] text-[0.7rem] font-semibold uppercase tracking-wider">Producto</th>
                    <th className="py-2 px-3 text-right text-[#a0a0b0] text-[0.7rem] font-semibold uppercase tracking-wider">Precio</th>
                    <th className="py-2 px-3 text-right text-[#a0a0b0] text-[0.7rem] font-semibold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="overflow-y-auto flex-1 min-h-0 max-h-60">
                  {cart.map((item) => (
                    <tr key={item.id} className="border-b border-[#3a3a4a] last:border-none">
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                          min="1"
                          className="w-12 border rounded text-center bg-[#1D1D27] text-[#F0F0F0] border-[#3a3a4a] focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] text-sm"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-[#F0F0F0] text-sm truncate max-w-[80px]">{item.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-[#F0F0F0] text-sm">
                        ${(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Button 
                          onClick={() => removeFromCart(item.id)} 
                          variant="ghost"
                          size="sm"
                          className="text-[#a0a0b0] hover:text-[#ff5252]"
                        >
                          <X size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-2 flex flex-col xs:flex-row justify-between items-center gap-3 pt-3 border-t border-[#3a3a4a] flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                <Button onClick={() => setIsScheduleVisitModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm"><Calendar size={14}/><span>Agendar</span></Button>
                <Button onClick={() => setIsDiscountModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm"><Percent size={14}/><span>Descuento</span></Button>
                <Button onClick={() => setIsNoteModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm"><FileText size={14}/><span>Nota</span></Button>
                {canAccessEmployeeConsumption && (
                  <Button onClick={() => setIsEmployeeConsumptionModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm">
                    <UserCircle size={14}/><span>Consumo</span>
                  </Button>
                )}
              </div>
              <div className="text-right text-[#F0F0F0]">
                <p className="text-[#a0a0b0] text-xs">Subtotal: ${subtotal.toLocaleString()}</p>
                <p className="text-lg font-bold text-[#F0F0F0]">Total: ${subtotal.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-2 flex-shrink-0">
              <Button onClick={() => setIsPreviousSalesModalOpen(true)} variant="outline" className="font-medium flex-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm transition-all duration-200 hover:scale-[1.02]">
                <Printer size={14} className="mr-1.5" />
                Ventas Anteriores
              </Button>
              <Button onClick={() => setIsCashClosingModalOpen(true)} variant="outline" className="font-medium flex-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm transition-all duration-200 hover:scale-[1.02]">
                <FileText size={14} className="mr-1.5" />
                Cierre de Caja
              </Button>
              <Button onClick={() => setIsWithdrawalModalOpen(true)} variant="outline" className="font-medium flex-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] text-sm transition-all duration-200 hover:scale-[1.02]">
                <CreditCard size={14} className="mr-1.5" />
                Retiro
              </Button>
            </div>
            
            <Button 
              onClick={handleCheckoutClick} 
              className="w-full mt-2 py-2 text-base bg-[#8A2BE2] hover:bg-purple-700 flex-shrink-0 transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg" 
              size="lg"
              variant="primary"
              disabled={offlineMode && cart.length === 0}
            >
              {offlineMode ? 'Modo Sin Conexión - Procesar Pago Local' : `Procesar Pago - ${subtotal.toLocaleString()}`}
            </Button>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col bg-[#282837] rounded-lg border border-[#3a3a4a] p-3 min-h-0 flex-1">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <div className="flex space-x-1.5">
              <Button onClick={() => setIsCalculatorModalOpen(true)} size="sm" className="bg-[#1D1D27] hover:bg-[#3a3a4a] text-[#F0F0F0] border border-[#3a3a4a] transition-all duration-200 hover:scale-105"><Calculator size={16} /></Button>
              <Button onClick={() => setIsProductCollectionModalOpen(true)} size="sm" className="bg-[#1D1D27] hover:bg-[#3a3a4a] text-[#F0F0F0] border border-[#3a3a4a] transition-all duration-200 hover:scale-105"><Package size={16} /></Button>
              <Button onClick={toggleScanning} size="sm" className="bg-[#1D1D27] hover:bg-[#3a3a4a] text-[#F0F0F0] border border-[#3a3a4a] transition-all duration-200 hover:scale-105">
                <Scan size={16} />
              </Button>
            </div>
            <Input icon={Search} type="text" placeholder="Buscar producto..." className="flex-1 ml-2 max-w-xs bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] placeholder-[#a0a0b0] text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          {/* Scale Status Banner */}
          <div className={`p-2 rounded-md border text-xs flex items-center justify-between mb-3 flex-shrink-0 ${
            scaleStatus === 'connected' 
              ? 'bg-green-500/10 border-green-500/30 text-green-300' 
              : scaleStatus === 'error' 
                ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
          }`}>
            <div className="flex items-center">
              <Scale size={14} className="mr-1.5" />
              <span className="font-medium">Balanza: {scaleStatusMessage}</span>
            </div>
            <div className="flex space-x-1.5">
              <Button 
                size="sm" 
                variant={scaleService.isConnected ? "outline" : "default"}
                onClick={() => {
                  if (scaleService.isConnected) {
                    scaleService.disconnect();
                  } else {
                    scaleService.connect('simulate');
                  }
                }}
                className={scaleService.isConnected 
                  ? "border border-[#3a3a4a] text-[#F0F0F0] hover:bg-[#3a3a4a] text-xs" 
                  : "bg-[#8A2BE2] text-white hover:bg-purple-700 text-xs"
                }
              >
                {scaleService.isConnected ? 'Desconectar' : 'Conectar'}
              </Button>
            </div>
          </div>

          {isScanning && (
                  <ScannerComponent
                    onScan={handleScan}
                    onClose={() => setIsScanning(false)}
                  />
                )}
          <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0">
            {categories.slice(0, 6).map(c => <Button key={c.id} variant="outline" size="sm" className="py-0.5 font-medium text-xs whitespace-nowrap text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] transition-all duration-200 hover:scale-105">{c.name}</Button>)}
            {categories.length > 6 && (
              <Button variant="outline" size="sm" className="py-0.5 font-medium text-xs text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a] transition-all duration-200 hover:scale-105" onClick={() => setIsProductCollectionModalOpen(true)}>
                +{categories.length - 6}
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden min-h-0" style={{ minHeight: 0, height: 'calc(100% - 150px)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-y-auto" style={{ height: '100%', padding: '6px', maxHeight: '100%' }}>
              {productsForSale.map(p => (
                <div 
                  key={p.id} 
                  className={`relative rounded-lg p-3 text-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 shadow-md border ${
                    p.stockInLocation === 0 ? "bg-[#3a3a4a] border-[#5c5c6c] cursor-not-allowed opacity-60" : "bg-[#282837] border-[#3a3a4a] hover:bg-[#3a3a4a] hover:border-blue-400"
                  } ${
                    (p.unit === "kg" || p.unit === "gr" || p.unit === "lb" || p.unit === "oz") ? "ring-2 ring-[#8A2BE2] ring-opacity-50" : ""
                  }`}
                  onClick={() => {
                    // En modo de prueba, permitir agregar productos al carrito incluso si no hay stock
                    if (p.stockInLocation > 0 || process.env.NODE_ENV === 'development') {
                      // Check if product is sold by weight
                      if (p.unit === "kg" || p.unit === "gr" || p.unit === "lb" || p.unit === "oz") {
                        // Open weight modal instead of adding to cart
                        openWeightModal(p);
                      } else {
                        // Add to cart normally for unit-based products
                        addToCart(p);
                      }
                    } else {
                      // Show message if no stock available
                      alert(`No hay existencias disponibles para ${p.name}`);
                    }
                  }}
                >
                   <div className={`absolute top-1 right-1 text-[0.7rem] font-bold px-2 py-1 rounded-full ${
                     p.stockInLocation === 0 ? "bg-[#666666] text-white" :
                     p.stockInLocation < 10 ? "bg-[#ff5252] text-white" : 
                     p.stockInLocation < 20 ? "bg-[#ffab00] text-[#1f1f1f]" : 
                     "bg-[#00c853] text-white"
                   }`}>
                    {p.stockInLocation} {p.unit === 'unidad' ? '' : p.unit || ''}
                  </div>
                  <div className="bg-[#3a3a4a] rounded-lg w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <Package className="w-8 h-8 text-[#a0a0b0]" />
                    )}
                  </div>
                  <p className="text-[0.85rem] font-semibold text-[#F0F0F0] truncate">{p.name}</p>
                  <p className="text-[0.9rem] font-bold text-[#8A2BE2]">${p.price}{(p.unit === 'kg' || p.unit === 'gr' || p.unit === 'lb' || p.unit === 'oz') ? `/${p.unit}` : ''}</p>
                  {p.unit !== 'unidad' && (p.unit === 'kg' || p.unit === 'gr' || p.unit === 'lb' || p.unit === 'oz') && (
                    <p className="text-[0.7rem] text-[#a0a0b0] mt-1">Por {p.unit}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Button className="w-full mt-3 py-2 font-semibold flex items-center justify-center space-x-1.5 bg-[#8A2BE2] hover:bg-purple-700 text-sm flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-200" onClick={() => setIsProductFormModalOpen(true)}>
            <Plus size={14} />
            <span>Agregar Producto</span>
          </Button>
        </div>

        {lastSale && (
          <Modal isOpen={postPaymentModalOpen} onClose={() => setPostPaymentModalOpen(false)} title="Opciones de Ticket">
            <div className="p-4">
              <Ticket saleDetails={lastSale} />
              <div className="flex justify-end space-x-4 mt-4">
                <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
                  Imprimir Ticket
                </Button>
                <Button onClick={() => {
                  // Logic to save ticket (e.g., download as PDF/image)
                  alert('Funcionalidad de guardar ticket no implementada aún.');
                  setPostPaymentModalOpen(false);
                }} className="bg-green-600 text-white hover:bg-green-700">
                  Guardar Ticket
                </Button>
                <Button onClick={() => setPostPaymentModalOpen(false)} className="bg-gray-300 hover:bg-gray-400">
                  Cerrar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {canAccessEmployeeConsumption && (
          <Modal isOpen={isEmployeeConsumptionModalOpen} onClose={() => setIsEmployeeConsumptionModalOpen(false)} title="Registrar Consumo de Empleados">
            <EmployeeConsumptionModal onClose={() => setIsEmployeeConsumptionModalOpen(false)} />
          </Modal>
        )}

        <Modal isOpen={isTicketDesignModalOpen} onClose={() => setIsTicketDesignModalOpen(false)} title="Editar Diseño de Ticket">
          <TicketDesignModal onClose={() => setIsTicketDesignModalOpen(false)} />
        </Modal>

        <Modal isOpen={isCalculatorModalOpen} onClose={() => setIsCalculatorModalOpen(false)} title="Calculadora">
          <CalculatorModal onClose={() => setIsCalculatorModalOpen(false)} />
        </Modal>

        <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title="Aplicar Descuento">
          <DiscountModal onClose={() => setIsDiscountModalOpen(false)} />
        </Modal>

        <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Añadir Nota a la Venta">
          <NoteModal onClose={() => setIsNoteModalOpen(false)} />
        </Modal>

        <Modal isOpen={isPaymentMethodModalOpen} onClose={() => setIsPaymentMethodModalOpen(false)} title="Procesar Pago">
          <PaymentModal 
            onClose={() => setIsPaymentMethodModalOpen(false)}
            onPayment={handlePaymentSuccess}
            total={subtotal}
          />
        </Modal>

        <Modal isOpen={isCashClosingModalOpen} onClose={() => setIsCashClosingModalOpen(false)} title="Cierre de Caja">
          <CashClosingModal onClose={() => setIsCashClosingModalOpen(false)} />
        </Modal>

        <Modal isOpen={isProductFormModalOpen} onClose={() => setIsProductFormModalOpen(false)} title="Añadir Producto">
          <ProductFormModal onClose={() => setIsProductFormModalOpen(false)} />
        </Modal>

        <Modal isOpen={isPreviousSalesModalOpen} onClose={() => setIsPreviousSalesModalOpen(false)} title="Ventas Anteriores">
          <PreviousSalesModal onClose={() => setIsPreviousSalesModalOpen(false)} />
        </Modal>

        <Modal isOpen={isScheduleVisitModalOpen} onClose={() => setIsScheduleVisitModalOpen(false)} title="Agendar Visita de Proveedor">
          <ScheduleVisitModal onClose={() => setIsScheduleVisitModalOpen(false)} />
        </Modal>

        <Modal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} title="Retiro de Efectivo">
          <WithdrawalModal onClose={() => setIsWithdrawalModalOpen(false)} />
        </Modal>

        <Modal isOpen={isProductCollectionModalOpen} onClose={() => setIsProductCollectionModalOpen(false)} title="Colección de Productos">
          <ProductCollectionModal onClose={() => setIsProductCollectionModalOpen(false)} />
        </Modal>

        <WeightModal 
          isOpen={isWeightModalOpen} 
          onClose={closeWeightModal} 
          product={weighingProduct}
          onAddToCart={(weight) => {
            addToCartWithWeight(weighingProduct, weight);
            closeWeightModal();
          }}
        />
      </main>
  );
}
