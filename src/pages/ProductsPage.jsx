import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import ProductFormModal from '../features/products/ProductFormModal';
import Modal from '../components/ui/Modal';

const ProductsPage = () => {
  const { 
    products, 
    categories, 
    addProduct,
    updateProduct,
    deleteProduct
  } = useAppStore();
  const navigate = useNavigate();
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

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Catálogo de Productos</h2>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => {
            setCurrentProduct(null);
            setShowProductModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos, SKU o código de barras..."
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
                  const category = categories.find(c => c.id === product.categoryId) || {};
                  return (
                    <tr 
                      key={product.id} 
                      className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors"
                    >
                      <td className="py-4 px-6 text-[#F0F0F0] font-medium">
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs text-[#a0a0b0]">{product.description || 'Sin descripción'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#a0a0b0]">{category.name || 'Sin categoría'}</td>
                      <td className="py-4 px-6 text-[#8A2BE2] font-bold">${product.price?.toFixed(2) || '0.00'}</td>
                      <td className="py-4 px-6 text-[#F0F0F0]">${product.cost?.toFixed(2) || '0.00'}</td>
                      <td className="py-4 px-6 text-[#F0F0F0]">{product.sku || 'N/A'}</td>
                      <td className="py-4 px-6 text-[#F0F0F0]">{product.barcode || 'N/A'}</td>
                      <td className="py-4 px-6 text-[#F0F0F0]">{product.unit || 'unidad'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                            onClick={() => deleteProduct(product.id)}
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
      
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
        <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Gestión de Inventario</h3>
        <p className="text-[#a0a0b0] mb-2">
          Para gestionar el stock real (cuánto tienes y dónde está), use el módulo de Inventario por Lotes.
        </p>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          onClick={() => {
            navigate('/inventory');
          }}
        >
          Ir a Inventario por Lotes
        </button>
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
    </div>
  );
};

export default ProductsPage;