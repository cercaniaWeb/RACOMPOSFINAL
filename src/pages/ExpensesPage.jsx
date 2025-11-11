import React, { useState, useEffect } from 'react';
import { Plus, Package, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ShoppingListModal from '../features/purchases/ShoppingListModal';
import useNotification from '../features/notifications/hooks/useNotification';

const ExpensesPage = () => {
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const { expenses, loadExpenses } = useAppStore();
  const { showInfo } = useNotification();

  // Load expenses when component mounts
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleOpenShoppingList = () => {
    setShowShoppingListModal(true);
    showInfo('Abriendo lista de compras...');
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
    </div>
  );
};

export default ExpensesPage;