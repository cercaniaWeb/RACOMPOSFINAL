import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const CategoryManagementModal = ({ onClose }) => {
  const { 
    categories,
    addCategory: storeAddCategory, 
    updateCategory: storeUpdateCategory, 
    deleteCategory: storeDeleteCategory 
  } = useAppStore();
  const [newCategory, setNewCategory] = useState({ name: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Group categories by parent
  const groupedCategories = categories.reduce((acc, category) => {
    if (!category.parentId) {
      acc[category.id] = { ...category, subcategories: [] };
    }
    return acc;
  }, {});

  // Add subcategories to their parent categories
  categories.forEach(category => {
    if (category.parentId && groupedCategories[category.parentId]) {
      groupedCategories[category.parentId].subcategories.push(category);
    }
  });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      await storeAddCategory({
        name: newCategory.name,
        parentId: newCategory.parentId || null
      });
      setNewCategory({ name: '', parentId: '' });
    }
  };

  const handleSubmitUpdateCategory = async (e) => {
    e.preventDefault();
    if (editingCategory && editingCategory.name.trim()) {
      await storeUpdateCategory(editingCategory.id, { name: editingCategory.name });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Esto también eliminará sus subcategorías.')) {
      await storeDeleteCategory(id);
    }
  };

  const toggleCategory = (id) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderCategory = (category, level = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    
    return (
      <div key={category.id} className="ml-4">
        <div className="flex items-center justify-between py-2 border-b border-[#3a3a4a]">
          <div className="flex-1 flex items-center">
            {hasSubcategories && (
              <button 
                onClick={() => toggleCategory(category.id)}
                className="mr-2 text-[#a0a0b0] hover:text-[#F0F0F0]"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {!hasSubcategories && <div className="w-6 mr-2"></div>} {/* Spacer for alignment */}
            
            {editingCategory?.id === category.id ? (
              <form onSubmit={handleSubmitUpdateCategory} className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="flex-1 bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded px-2 py-1 focus:border-[#8A2BE2] outline-none"
                  autoFocus
                />
                <button type="submit" className="bg-[#8A2BE2] text-white px-2 py-1 rounded hover:bg-[#7a1bd2]">
                  Guardar
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)}
                  className="bg-[#3a3a4a] text-[#F0F0F0] px-2 py-1 rounded hover:bg-[#4a4a5a]"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <span className="text-[#F0F0F0]">{category.name}</span>
            )}
          </div>
          
          {editingCategory?.id !== category.id && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setEditingCategory(category)}
                className="text-[#a0a0b0] hover:text-[#8A2BE2]"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDeleteCategory(category.id)}
                className="text-[#a0a0b0] hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        
        {hasSubcategories && isExpanded && (
          <div className="ml-6">
            {category.subcategories.map(subcategory => renderCategory(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#282837] rounded-xl border border-[#3a3a4a] max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#F0F0F0]">Gestión de Categorías</h3>
        <button 
          onClick={onClose}
          className="text-[#a0a0b0] hover:text-[#F0F0F0]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Nombre de la Categoría</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              placeholder="Nombre de la categoría"
              required
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Categoría Padre (Opcional)</label>
            <select
              value={newCategory.parentId}
              onChange={(e) => setNewCategory({...newCategory, parentId: e.target.value || ''})}
              className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            >
              <option value="">Categoría Principal</option>
              {categories.filter(cat => !cat.parentId).map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#8A2BE2] text-white py-2 px-4 rounded-lg hover:bg-[#7a1bd2] flex items-center justify-center space-x-2"
          >
            <Plus size={18} />
            <span>Agregar Categoría</span>
          </button>
        </form>
      </div>

      <div>
        <h4 className="text-lg font-bold text-[#F0F0F0] mb-4">Categorías Existentes</h4>
        {Object.values(groupedCategories).map(category => renderCategory(category))}
      </div>
    </div>
  );
};

export default CategoryManagementModal;