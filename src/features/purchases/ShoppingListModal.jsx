import React, { useState } from 'react';
import { Package, Check, X, Plus, Edit } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const ShoppingListModal = ({ onClose }) => {
  const { 
    products, 
    shoppingList, 
    addToShoppingList, 
    updateShoppingList, 
    removeFromShoppingList,
    addExpense: storeAddExpense
  } = useAppStore();
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, cost: 0 });
  const [editingItem, setEditingItem] = useState(null);

  // Calculate total for checked items
  const checkedItemsTotal = shoppingList
    .filter(item => item.checked)
    .reduce((total, item) => {
      const cost = item.cost ? parseFloat(item.cost) : 0;
      const quantity = item.quantity ? parseInt(item.quantity) : 1;
      return total + (cost * quantity);
    }, 0);

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.quantity > 0) {
      const itemToAdd = {
        id: `shop-${Date.now()}`,
        ...newItem,
        checked: false,
        createdAt: new Date().toISOString()
      };
      addToShoppingList(itemToAdd);
      setNewItem({ name: '', quantity: 1, cost: 0 });
    }
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      updateShoppingList(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  const handleCheckItem = (id) => {
    const item = shoppingList.find(i => i.id === id);
    if (item) {
      updateShoppingList(id, { ...item, checked: !item.checked });
    }
  };

  const handleGenerateExpense = async () => {
    const checkedItems = shoppingList.filter(item => item.checked);
    
    if (checkedItems.length === 0) {
      alert('No hay ítems seleccionados para generar un gasto.');
      return;
    }

    // Calculate total amount
    const totalAmount = checkedItems.reduce((total, item) => {
      const cost = item.cost ? parseFloat(item.cost) : 0;
      const quantity = item.quantity ? parseInt(item.quantity) : 1;
      return total + (cost * quantity);
    }, 0);

    // Create expense from checked items
    const expenseData = {
      date: new Date().toISOString(),
      concept: 'Compra de Inventario',
      amount: totalAmount,
      type: 'Compra de Inventario',
      details: checkedItems.map(item => `${item.name} x${item.quantity}`).join(', ')
    };

    try {
      // Add the expense
      await storeAddExpense(expenseData);

      // Remove checked items from shopping list
      checkedItems.forEach(item => removeFromShoppingList(item.id));
      
      alert('Gasto generado exitosamente.');
      onClose();
    } catch (error) {
      console.error('Error generating expense:', error);
      alert('Error al generar el gasto: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-[#282837] rounded-xl border border-[#3a3a4a] max-w-2xl w-full max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#F0F0F0]">Lista de Compras</h3>
        <button 
          onClick={onClose}
          className="text-[#a0a0b0] hover:text-[#F0F0F0]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        <div className="mb-6 p-4 bg-[#1D1D27] rounded-lg border border-[#3a3a4a]">
          <h4 className="font-bold text-[#F0F0F0] mb-3">Agregar Artículo</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Nombre del Artículo</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Nombre del producto"
                className="w-full bg-[#282837] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Cantidad</label>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                min="1"
                className="w-full bg-[#282837] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo Unitario</label>
              <input
                type="number"
                value={newItem.cost}
                onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.01"
                placeholder="Costo"
                className="w-full bg-[#282837] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleAddItem}
            className="mt-3 w-full bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar a Lista</span>
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-bold text-[#F0F0F0] mb-3">Artículos en Lista</h4>
          {shoppingList.length === 0 ? (
            <p className="text-[#a0a0b0] text-center py-4">No hay artículos en la lista de compras</p>
          ) : (
            <div className="space-y-2">
              {shoppingList.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.checked 
                      ? 'bg-green-500 bg-opacity-10 border-green-500' 
                      : 'bg-[#1D1D27] border-[#3a3a4a]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={() => handleCheckItem(item.id)}
                      className="w-4 h-4 text-[#8A2BE2] rounded focus:ring-[#8A2BE2] border-[#3a3a4a] bg-[#282837]"
                    />
                    <div>
                      <p className="font-medium text-[#F0F0F0]">{item.name}</p>
                      <p className="text-sm text-[#a0a0b0]">Cantidad: {item.quantity} | Costo unitario: ${item.cost || '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="text-[#a0a0b0] hover:text-[#8A2BE2]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeFromShoppingList(item.id)}
                      className="text-[#a0a0b0] hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#3a3a4a] pt-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[#a0a0b0]">Total de artículos marcados:</p>
          <p className="font-bold text-[#F0F0F0]">${checkedItemsTotal.toFixed(2)}</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#3a3a4a] hover:bg-[#4a4a5a] text-[#F0F0F0] py-2 px-4 rounded-lg"
          >
            Cerrar
          </button>
          <button
            onClick={handleGenerateExpense}
            className="flex-1 bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
          >
            Generar Gasto
          </button>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md p-6">
            <h4 className="text-lg font-bold text-[#F0F0F0] mb-4">Editar Artículo</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Cantidad</label>
                <input
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 1})}
                  min="1"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo Unitario</label>
                <input
                  type="number"
                  value={editingItem.cost}
                  onChange={(e) => setEditingItem({...editingItem, cost: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-[#3a3a4a] hover:bg-[#4a4a5a] text-[#F0F0F0] py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateItem}
                className="flex-1 bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListModal;