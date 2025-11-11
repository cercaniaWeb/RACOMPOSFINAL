import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, Filter, BarChart3, Download, Upload } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import ProductForm from './ProductForm';

const ProductsPage = () => {
  const { 
    products, 
    categories, 
    stores,
    addProduct, 
    updateProduct, 
    deleteProduct,
    inventoryBatches
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Filter products based on search term, selected category and selected store
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const category = categories.find(c => c.id === product.categoryId);
    const matchesCategory = selectedCategory === 'all' || 
      category?.name === selectedCategory;
    
    // For store filtering, check if product has inventory in the selected store
    let matchesStore = selectedStore === 'all';
    if (selectedStore !== 'all') {
      const storeInventory = inventoryBatches.filter(
        batch => batch.productId === product.id && batch.locationId === selectedStore
      );
      matchesStore = storeInventory.length > 0;
    }
    
    return matchesSearch && matchesCategory && matchesStore;
  });
  
  // Get unique categories for the filter dropdown
  const uniqueCategories = [...new Set(categories.map(c => c.name).filter(Boolean))];
  
  // Get unique stores for the filter dropdown
  const uniqueStores = [...new Set(stores.map(s => s.name).filter(Boolean))];

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (productId) => {
    if (currentProduct) {
      // Update logic already handled in ProductForm, just close modal
    } else {
      // Add logic already handled in ProductForm, just close modal
    }
    setShowProductModal(false);
    // After saving, we might want to refresh the product list to ensure the new product is visible
    // For now, the useAppStore's addProduct/updateProduct already triggers a reload.
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(productId);
    }
  };

  // Calculate total inventory by store
  const calculateInventoryByStore = (productId) => {
    const productInventory = inventoryBatches.filter(batch => batch.productId === productId);
    return productInventory.reduce((total, batch) => total + batch.quantity, 0);
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#F0F0F0]">Catálogo de Productos</h2>
                <p className="text-[#a0a0b0] text-sm mt-1">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                onClick={handleAddProduct}
                data-testid="add-product-button"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
              </button>
            </div>
      
            {/* Filters and Controls */}
            <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-4">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar productos, SKU o código de barras..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                      data-testid="product-search-input"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                      data-testid="category-filter-select"
                    >
                      <option value="all" className="bg-[#282837] text-[#F0F0F0]">Todas las categorías</option>
                      {uniqueCategories.map(category => (
                        <option key={category} value={category} className="bg-[#282837] text-[#F0F0F0]">
                          {category}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      value={selectedStore} 
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                      data-testid="store-filter-select"
                    >
                      <option value="all" className="bg-[#282837] text-[#F0F0F0]">Todos los almacenes</option>
                      {uniqueStores.map(store => (
                        <option key={store} value={store} className="bg-[#282837] text-[#F0F0F0]">
                          {store}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-[#8A2BE2] text-white' : 'bg-[#3a3a4a] text-[#F0F0F0]'}`}
                    data-testid="table-view-button"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#8A2BE2] text-white' : 'bg-[#3a3a4a] text-[#F0F0F0]'}`}
                    data-testid="grid-view-button"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
      
            {/* Products List */}
            <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1D1D27] border-b border-[#3a3a4a]">
                      <tr>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Producto</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Categoría</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Precio</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Costo</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">SKU</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Código de Barras</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Unidad</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Inventario</th>
                        <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody data-testid="product-table-body">
                      {filteredProducts.map((product) => {
                        const category = categories.find(c => c.id === product.categoryId);
                        const totalInventory = calculateInventoryByStore(product.id);
                        
                        return (
                          <tr 
                            key={product.id} 
                            data-testid={`product-row-${product.id}`}
                            className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors"
                          >
                            <td className="py-4 px-6 text-[#F0F0F0] font-medium">
                              <div className="flex items-center space-x-3">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="bg-[#3a3a4a] w-10 h-10 rounded flex items-center justify-center">
                                    <Package className="w-5 h-5 text-[#a0a0b0]" />
                                  </div>
                                )}
                                <div>
                                  <div>{product.name}</div>
                                  <div className="text-xs text-[#a0a0b0]">{product.description || 'Sin descripción'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-[#a0a0b0]">{category?.name || 'Sin categoría'}</td>
                            <td className="py-4 px-6 text-[#8A2BE2] font-bold">${product.price?.toFixed(2)}</td>
                            <td className="py-4 px-6 text-[#F0F0F0]">${product.cost?.toFixed(2)}</td>
                            <td className="py-4 px-6 text-[#F0F0F0]">{product.sku || 'N/A'}</td>
                            <td className="py-4 px-6 text-[#F0F0F0]">{product.barcode || 'N/A'}</td>
                            <td className="py-4 px-6 text-[#F0F0F0]">{product.unit || 'unidad'}</td>
                            <td className="py-4 px-6 text-[#F0F0F0]">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                totalInventory > 0 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {totalInventory} en stock
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                                  data-testid={`edit-product-button-${product.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                                  data-testid={`delete-product-button-${product.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Grid view
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                      const category = categories.find(c => c.id === product.categoryId);
                      const totalInventory = calculateInventoryByStore(product.id);
                      
                      return (
                        <div 
                          key={product.id} 
                          data-testid={`product-grid-item-${product.id}`}
                          className="bg-[#1D1D27] border border-[#3a3a4a] rounded-xl p-4 hover:border-[#8A2BE2] transition-colors"
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-center mb-3">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-16 h-16 rounded object-cover"
                                />
                              ) : (
                                  <div className="bg-[#3a3a4a] w-16 h-16 rounded flex items-center justify-center">
                                    <Package className="w-8 h-8 text-[#a0a0b0]" />
                                  </div>
                                )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#F0F0F0] text-sm mb-1 truncate">{product.name}</h3>
                              <p className="text-xs text-[#a0a0b0] mb-2 truncate">{product.description || 'Sin descripción'}</p>
                              
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[#8A2BE2] font-bold">${product.price?.toFixed(2)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  totalInventory > 0 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {totalInventory} en stock
                                </span>
                              </div>
                              
                              <div className="text-xs text-[#a0a0b0] mb-2">
                                <div>Categoría: {category?.name || 'Sin categoría'}</div>
                                <div>SKU: {product.sku || 'N/A'}</div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                                data-testid={`edit-product-button-${product.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                                data-testid={`delete-product-button-${product.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-[#a0a0b0] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#F0F0F0] mb-1">No se encontraron productos</h3>
                  <p className="text-[#a0a0b0]">Intenta con diferentes filtros de búsqueda</p>
                </div>
              )}
            </div>
      
            {/* Product Form Modal */}
            {showProductModal && (
              <ProductForm 
                product={currentProduct} 
                onClose={() => setShowProductModal(false)} 
                onSuccess={handleSaveProduct} 
                mode="modal" 
              />
            )}
          </div>
        );
      };
      
      export default ProductsPage;