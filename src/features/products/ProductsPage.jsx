import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const ProductsPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Filter products based on search term and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const category = categories.find(c => c.id === product.categoryId);
    const matchesCategory = selectedCategory === 'all' || 
      category?.name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories for the filter dropdown
  const uniqueCategories = [...new Set(categories.map(c => c.name).filter(Boolean))];

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (productData) => {
    if (currentProduct) {
      await updateProduct(currentProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setShowProductModal(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Catálogo de Productos</h2>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={handleAddProduct}
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar productos, SKU o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
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
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Precio</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Costo</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">SKU</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Código de Barras</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Unidad</th>
                  <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr 
                      key={product.id} 
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
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;