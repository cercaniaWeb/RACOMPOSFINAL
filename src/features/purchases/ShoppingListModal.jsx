import React, { useState } from 'react';
import { Package, Check, X, Plus, Edit, AlertCircle } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { validateShoppingItem } from '../../utils/formValidation';
import useNotification from '../notifications/hooks/useNotification';

const ShoppingListModal = ({ onClose }) => {
  const {
    shoppingList,
    addToShoppingList,
    updateShoppingListItem,
    removeShoppingListItem,
    addExpense: storeAddExpense,
    currentUser
  } = useAppStore();
  const [newItem, setNewItem] = useState({ name: '', cost: 0 });
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError, showInfo } = useNotification();

  // Calculate total for purchased items
  const purchasedItemsTotal = shoppingList
    .filter(item => item.isPurchased)
    .reduce((total, item) => {
      const cost = item.actualCost ? parseFloat(item.actualCost) : item.expectedCost || 0;
      return total + cost;
    }, 0);

  const handleAddItem = () => {
    const validation = validateShoppingItem(newItem);
    if (!validation.isValid) {
      setErrors(validation.errors);
      showError('Por favor, corrige los errores en el formulario.');
      return;
    }

    // Clear errors for this field if valid
    setErrors({});
    
    // Add item using the store's expected format
    addToShoppingList(newItem.name, newItem.cost);
    setNewItem({ name: '', cost: 0 });
    showSuccess('Artículo agregado a la lista de compras.');
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      // Validate the editing item
      const itemToValidate = {
        name: editingItem.description || editingItem.name || '',
        cost: editingItem.actualCost || editingItem.expectedCost || editingItem.cost || 0
      };
      
      const validation = validateShoppingItem(itemToValidate);
      if (!validation.isValid) {
        setErrors(validation.errors);
        showError('Por favor, corrige los errores en el formulario.');
        return;
      }

      // Update using store function with the correct format
      updateShoppingListItem(editingItem.id, {
        description: editingItem.description || editingItem.name,
        expectedCost: editingItem.expectedCost || editingItem.cost,
        actualCost: editingItem.actualCost || editingItem.cost
      });
      setEditingItem(null);
      setErrors({});
      showSuccess('Artículo actualizado correctamente.');
    }
  };

  const handleCheckItem = (id) => {
    const item = shoppingList.find(i => i.id === id);
    if (item) {
      // Toggle the purchased status
      updateShoppingListItem(id, { isPurchased: !item.isPurchased });
      showInfo(`'${item.description || item.id}' marcado como ${!item.isPurchased ? 'comprado' : 'pendiente'}.`);
    }
  };

  const handleRemoveShoppingListItem = (id) => {
    removeShoppingListItem(id);
    showSuccess('Artículo eliminado de la lista.');
  };

  const handleGenerateExpense = async () => {
    const purchasedItems = shoppingList.filter(item => item.isPurchased); 

    if (purchasedItems.length === 0) {
      showError('No hay ítems seleccionados para generar un gasto.');
      return;
    }

    // Calculate total amount
    const totalAmount = purchasedItems.reduce((total, item) => {
      const cost = item.actualCost ? parseFloat(item.actualCost) : item.expectedCost || 0;
      return total + cost;
    }, 0);

    // Determine if the expense should be approved based on user role
    const userRole = currentUser?.role;
    const isApproved = (userRole === 'admin' || userRole === 'gerente');

    // Create expense from purchased items
    const expenseData = {
      date: new Date().toISOString(),
      concept: 'Compra de Inventario',
      amount: totalAmount,
      type: 'Compra de Inventario',
      details: purchasedItems.map(item => `${item.description || item.id}`).join(', '),
      status: isApproved ? 'approved' : 'pending'
    };

    try {
      // Add the expense
      await storeAddExpense(expenseData);

      // If the expense is pending approval, notify admins
      if (expenseData.status === 'pending') {
        // This will trigger a notification to admins if available
        if (window.notifyPendingExpense) {
          window.notifyPendingExpense(expenseData);
        }
        showInfo('Gasto generado y pendiente de aprobación.');
      } else {
        showSuccess('Gasto generado exitosamente.');
      }

      // Remove purchased items from shopping list
      purchasedItems.forEach(item => removeShoppingListItem(item.id));

      onClose();
    } catch (error) {
      console.error('Error generating expense:', error);
      showError('Error al generar el gasto: ' + error.message);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Nombre del Artículo</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => {
                  setNewItem({...newItem, name: e.target.value});
                  if (errors.name) setErrors(prev => ({...prev, name: null}));
                }}
                placeholder="Nombre del producto"
                className={`w-full bg-[#282837] text-[#F0F0F0] border ${
                  errors.name ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none`}
              />
              {errors.name && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo Estimado</label>
              <input
                type="number"
                value={newItem.cost}
                onChange={(e) => {
                  setNewItem({...newItem, cost: parseFloat(e.target.value) || 0});
                  if (errors.cost) setErrors(prev => ({...prev, cost: null}));
                }}
                min="0"
                step="0.01"
                placeholder="Costo"
                className={`w-full bg-[#282837] text-[#F0F0F0] border ${
                  errors.cost ? 'border-red-500' : 'border-[#3a3a4a]'
                } rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none`}
              />
              {errors.cost && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cost}
                </div>
              )}
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
                    item.isPurchased
                      ? 'bg-green-500 bg-opacity-10 border-green-500'
                      : 'bg-[#1D1D27] border-[#3a3a4a]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.isPurchased || false}
                      onChange={() => handleCheckItem(item.id)}
                      className="w-4 h-4 text-[#8A2BE2] rounded focus:ring-[#8A2BE2] border-[#3a3a4a] bg-[#282837]"
                    />
                    <div>
                      <p className="font-medium text-[#F0F0F0]">{item.description || item.id}</p>
                      <p className="text-sm text-[#a0a0b0]">Costo estimado: ${item.expectedCost?.toFixed(2) || '0.00'} | Costo real: ${item.actualCost?.toFixed(2) || '0.00'}</p>
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
                      onClick={() => handleRemoveShoppingListItem(item.id)}
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
          <p className="font-bold text-[#F0F0F0]">${purchasedItemsTotal.toFixed(2)}</p>
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
                  value={editingItem.description || editingItem.name || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo Estimado</label>
                <input
                  type="number"
                  value={editingItem.expectedCost || 0}
                  onChange={(e) => setEditingItem({...editingItem, expectedCost: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Costo Real</label>
                <input
                  type="number"
                  value={editingItem.actualCost || 0}
                  onChange={(e) => setEditingItem({...editingItem, actualCost: parseFloat(e.target.value) || 0})}
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