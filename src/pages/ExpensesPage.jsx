import React, { useState, useEffect } from 'react';
import { Plus, Package, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ShoppingListModal from '../features/purchases/ShoppingListModal';
import useNotification from '../features/notifications/hooks/useNotification';

const ExpensesPage = () => {
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const { expenses, loadExpenses, deleteExpense, updateExpense } = useAppStore();
  const { showInfo, showSuccess, showError } = useNotification();

  // Load expenses when component mounts
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleOpenShoppingList = () => {
    setShowShoppingListModal(true);
    showInfo('Abriendo lista de compras...');
  };

  const handleEditExpense = (expense) => {
    setCurrentExpense(expense);
    setShowEditModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        const result = await deleteExpense(expenseId);
        if (result.success) {
          showSuccess('Gasto eliminado correctamente.');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        showError(`Error al eliminar el gasto: ${error.message}`);
      }
    }
  };

  const handleSaveExpense = async (updatedExpense) => {
    try {
      const result = await updateExpense(updatedExpense.id || updatedExpense.expenseId, updatedExpense);
      if (result.success) {
        showSuccess('Gasto actualizado correctamente.');
        setShowEditModal(false);
        setCurrentExpense(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      showError(`Error al actualizar el gasto: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Gastos Misceláneos</h2>
        <button
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={handleOpenShoppingList}
        >
          <Plus className="w-4 h-4" />
          <span>Lista de Compras</span>
        </button>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1D1D27] border-b border-[#3a3a4a]">
              <tr>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Fecha</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Descripción</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Categoría</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Monto</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id || expense.expenseId} className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors">
                  <td className="py-4 px-6 text-[#F0F0F0]">{expense.date || expense.created_at || expense.createdAt}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{expense.description || expense.desc}</td>
                  <td className="py-4 px-6 text-[#a0a0b0]">{expense.type || expense.category}</td>
                  <td className="py-4 px-6 text-[#F0F0F0] font-bold">${expense.amount ? parseFloat(expense.amount).toFixed(2) : '0.00'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (expense.status === 'Aprobado' || expense.status === 'approved') ? 'bg-green-500 bg-opacity-20 text-green-500' :
                      (expense.status === 'Pendiente' || expense.status === 'pending') ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                      'bg-red-500 bg-opacity-20 text-red-500'
                    }`}>
                      {expense.status || 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-[#8A2BE2] hover:text-purple-300"
                        title="Editar gasto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id || expense.expenseId)}
                        className="text-red-500 hover:text-red-300"
                        title="Eliminar gasto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shopping List Modal - Using the actual component */}
      {showShoppingListModal && (
        <div className="fixed inset-0 bg-[#222230] bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <ShoppingListModal onClose={() => setShowShoppingListModal(false)} />
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && currentExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#F0F0F0]">Editar Gasto</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentExpense(null);
                  }}
                  className="text-[#a0a0b0] hover:text-[#F0F0F0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Descripción</label>
                  <input
                    type="text"
                    value={currentExpense.description || currentExpense.desc || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                    className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Categoría</label>
                  <input
                    type="text"
                    value={currentExpense.type || currentExpense.category || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, type: e.target.value})}
                    className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Monto</label>
                  <input
                    type="number"
                    value={currentExpense.amount || 0}
                    onChange={(e) => setCurrentExpense({...currentExpense, amount: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Estado</label>
                  <select
                    value={currentExpense.status || 'pending'}
                    onChange={(e) => setCurrentExpense({...currentExpense, status: e.target.value})}
                    className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentExpense(null);
                  }}
                  className="flex-1 bg-[#3a3a4a] hover:bg-[#4a4a5a] text-[#F0F0F0] py-2 px-4 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveExpense(currentExpense)}
                  className="flex-1 bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;