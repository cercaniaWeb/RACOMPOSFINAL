import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit, Trash2, UserMinus, Scan } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import ProductFormModal from '../features/products/ProductFormModal';
import InventoryBatchFormModal from '../features/inventory/InventoryBatchFormModal';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import EmployeeConsumptionModal from '../features/inventory/components/EmployeeConsumptionModal';
import ScannerComponent from '../components/qr/ScannerComponent';
import useNotification from '../features/notifications/hooks/useNotification';

const InventoryPage = () => {
  const {
    products,
    categories,
    inventoryBatches,
    stores,
    currentUser,
    addToShoppingList,
    addInventoryBatch,
    deleteInventoryBatch,
    loadStores,
    loadProducts,
  } = useAppStore(state => ({
    products: state.products,
    categories: state.categories,
    inventoryBatches: state.inventoryBatches,
    stores: state.stores,
    currentUser: state.currentUser,
    addToShoppingList: state.addToShoppingList,
    addInventoryBatch: state.addInventoryBatch,
    deleteInventoryBatch: state.deleteInventoryBatch,
    loadStores: state.loadStores,
    loadProducts: state.loadProducts,
  }));
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [showEmployeeConsumptionModal, setShowEmployeeConsumptionModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { showSuccess, showError } = useNotification();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showInventoryBatchModal, setShowInventoryBatchModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  
  useEffect(() => {
    // Fetch stores if they are not already in the store
    if (stores.length === 0) {
      loadStores();
    }
    // Fetch products if they are not already in the store
    if (products.length === 0) {
      loadProducts();
    }
  }, [stores.length, loadStores, products.length, loadProducts]);
  
  // Combine product info with inventory batches and store names
  const inventoryByLocation = inventoryBatches.map(batch => {
    const product = products.find(p => p.id === batch.productId) || {};
    const category = categories.find(c => c.id === product.categoryId) || {};
    const store = stores.find(s => s.id === batch.locationId) || { name: batch.locationId };
    
    return {
      ...batch,
      productName: product.name || 'Producto Desconocido',
      productCategory: category.name || 'Sin Categoría',
      productPrice: product.price || 0,
      minStockThreshold: product.minStockThreshold?.[batch.locationId] || 0,
      locationName: store.name || batch.locationId,
      productSku: product.sku || '',
      barcode: product.barcode || '',
      expirationDate: batch.expirationDate || null
    };
  });
  
  // Filter the inventory based on search term and selected category
  const filteredInventory = inventoryByLocation.filter(item => {
    const matchesSearch = !searchTerm || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productSku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      item.productCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group inventory by product to show aggregated views
  const groupedInventory = {};
  filteredInventory.forEach(item => {
    const key = `${item.productId}-${item.locationId}`;
    if (!groupedInventory[key]) {
      groupedInventory[key] = {
        ...item,
        totalQuantity: 0,
        batches: []
      };
    }
    groupedInventory[key].totalQuantity += item.quantity;
    groupedInventory[key].batches.push(item);
  });
  
  const inventoryGroups = Object.values(groupedInventory);
  
  // Get unique categories for the filter dropdown
  const uniqueCategories = [...new Set(products.map(p => categories.find(c => c.id === p.categoryId)?.name).filter(Boolean))];

  const canManageConsumption = currentUser?.role === 'admin' || currentUser?.role === 'gerente';

  const handleScan = (scannedBarcode) => {
    const product = inventoryByLocation.find(p => p.barcode === scannedBarcode);
    if (product) {
      setSearchTerm(product.productName);
      showSuccess(`Producto encontrado: ${product.productName}`);
    } else {
      showError(`Producto con código ${scannedBarcode} no encontrado.`);
    }
    setIsScanning(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Inventario por Lotes</h2>
        <div className="flex items-center space-x-2">
          {canManageConsumption && (
            <button 
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              onClick={() => setShowEmployeeConsumptionModal(true)}
            >
              <UserMinus className="w-4 h-4" />
              <span>Consumo Empleado</span>
            </button>
          )}
          <button 
            className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            onClick={() => {
              // Open inventory batch modal
              setCurrentBatch(null);
              setShowInventoryBatchModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Lote</span>
          </button>
        </div>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar productos o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
            </div>
            <button
              onClick={() => setIsScanning(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Scan className="w-4 h-4" />
            </button>
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
          >
            <option value="all" className="bg-[#282837] text-[#F0F0F0]">Todas las categorías</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category} className="bg-[#282837] text-[#F0F0F0]">
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1D1D27] border-b border-[#3a3a4a]">
                <tr>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Producto</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Categoría</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Stock</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Mínimo</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Ubicación</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Vencimiento</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Costo Total</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventoryGroups.map((item) => (
                  <tr 
                    key={`${item.productId}-${item.locationId}`} 
                    className={`border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors ${
                      item.totalQuantity <= item.minStockThreshold ? 'bg-red-500 bg-opacity-10' : ''
                    }`}
                  >
                    <td className="py-4 px-6 text-[#F0F0F0] font-medium">
                      <div className="flex flex-col">
                        <span>{item.productName}</span>
                        <span className="text-xs text-[#a0a0b0]">{item.productSku}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#a0a0b0]">{item.productCategory}</td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${
                        item.totalQuantity <= item.minStockThreshold ? 'text-red-500' : 
                        item.totalQuantity <= item.minStockThreshold * 1.5 ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {item.totalQuantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#F0F0F0]">{item.minStockThreshold}</td>
                    <td className="py-4 px-6 text-[#F0F0F0]">{item.locationName}</td>
                    <td className="py-4 px-6 text-[#a0a0b0]">
                      {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-[#8A2BE2] font-bold">
                      ${(item.totalQuantity * item.cost).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`p-2 rounded-lg transition-colors ${
                            item.productName === 'Producto Desconocido' 
                              ? 'text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20' 
                              : 'text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a]'
                          }`}
                          onClick={() => {
                            setCurrentBatch(item.batches[0]); // Pass the first batch of the grouped item
                            setShowInventoryBatchModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                          onClick={() => {
                            setBatchToDelete(item.batches[0]);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
        <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Gestión de Productos</h3>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => {
            // Open the product form modal to add a new product
            setCurrentProduct(null);
            setShowProductModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto al Catálogo</span>
        </button>
        <p className="text-[#a0a0b0] text-sm mt-2">
          Para gestionar el catálogo de productos (qué vendes), use el módulo de Productos.
        </p>
      </div>

      {/* Product Form Modal */}
      <Modal 
        isOpen={showProductModal}
        title={currentProduct ? "Editar Producto" : "Agregar Producto"} 
        onClose={() => {
          setShowProductModal(false);
          setCurrentProduct(null);
        }}
      >
        <ProductFormModal 
          product={currentProduct} 
          onClose={() => {
            setShowProductModal(false);
            setCurrentProduct(null);
          }} 
        />
      </Modal>

      {/* Inventory Batch Form Modal */}
      <Modal 
        isOpen={showInventoryBatchModal}
        title={currentBatch && currentBatch.productName === 'Producto Desconocido' ? "Vincular Producto a Lote" : (currentBatch ? "Editar Lote de Inventario" : "Agregar Lote de Inventario")} 
        onClose={() => {
          setShowInventoryBatchModal(false);
          setCurrentBatch(null);
        }}
      >
        <InventoryBatchFormModal 
          batch={currentBatch} 
          onClose={() => {
            setShowInventoryBatchModal(false);
            setCurrentBatch(null);
          }} 
        />
      </Modal>
      
      {/* Employee Consumption Modal */}
      {showEmployeeConsumptionModal && (
        <EmployeeConsumptionModal onClose={() => setShowEmployeeConsumptionModal(false)} />
      )}

      {/* Scanner Modal */}
      {isScanning && (
        <ScannerComponent
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBatchToDelete(null);
        }}
        onConfirm={() => {
          if (batchToDelete) {
            deleteInventoryBatch(batchToDelete.id);
            setShowDeleteConfirm(false);
            setBatchToDelete(null);
          }
        }}
        title="Eliminar Lote de Inventario"
        message={`¿Estás seguro de que deseas eliminar este lote de inventario? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default InventoryPage;