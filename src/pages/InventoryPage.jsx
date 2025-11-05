import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import ProductFormModal from '../features/products/ProductFormModal';
import InventoryBatchFormModal from '../features/inventory/InventoryBatchFormModal';
import Modal from '../components/ui/Modal';

const InventoryPage = () => {
  const { 
    products, 
    categories, 
    inventoryBatches, 
    stores,
    addToShoppingList,
    addInventoryBatch
  } = useAppStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showInventoryBatchModal, setShowInventoryBatchModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  
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

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Inventario por Lotes</h2>
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

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
            </div>
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
                        <button className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors">
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
        title={currentBatch ? "Editar Lote de Inventario" : "Agregar Lote de Inventario"} 
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
    </div>
  );
};

export default InventoryPage;