import React, { useState } from 'react';
import { Plus, Package, X } from 'lucide-react';

const ExpensesPage = () => {
  const [showShoppingList, setShowShoppingList] = useState(false);
  
  // Mock data for expenses
  const expenses = [
    { id: 1, date: '2024-01-15', desc: 'Compra de suministros', category: 'Oficina', amount: '$245.50', status: 'Aprobado' },
    { id: 2, date: '2024-01-14', desc: 'Mantenimiento de equipos', category: 'Tecnología', amount: '$890.00', status: 'Pendiente' },
    { id: 3, date: '2024-01-13', desc: 'Servicios de limpieza', category: 'Servicios', amount: '$156.75', status: 'Aprobado' },
    { id: 4, date: '2024-01-12', desc: 'Combustible vehicular', category: 'Transporte', amount: '$89.20', status: 'Rechazado' },
    { id: 5, date: '2024-01-11', desc: 'Reparación de mobiliario', category: 'Mantenimiento', amount: '$345.00', status: 'Aprobado' }
  ];

  // Mock data for shopping list
  const [shoppingList, setShoppingList] = useState([
    { id: 1, item: 'Papel de impresora', quantity: 1 },
    { id: 2, item: 'Tinta para impresora', quantity: 2 },
    { id: 3, item: 'Baterías AA', quantity: 5 },
    { id: 4, item: 'Cables USB', quantity: 3 }
  ]);

  const handleAddShoppingItem = () => {
    setShoppingList([...shoppingList, { id: shoppingList.length + 1, item: '', quantity: 1 }]);
  };

  const handleUpdateShoppingItem = (id, field, value) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveShoppingItem = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Gastos Misceláneos</h2>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => setShowShoppingList(true)}
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
              {expenses.map((expense, index) => (
                <tr key={expense.id} className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors">
                  <td className="py-4 px-6 text-[#F0F0F0]">{expense.date}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{expense.desc}</td>
                  <td className="py-4 px-6 text-[#a0a0b0]">{expense.category}</td>
                  <td className="py-4 px-6 text-[#F0F0F0] font-bold">{expense.amount}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      expense.status === 'Aprobado' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                      expense.status === 'Pendiente' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                      'bg-red-500 bg-opacity-20 text-red-500'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-[#222230] bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a] w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#F0F0F0]">Lista de Compras</h3>
              <button 
                onClick={() => setShowShoppingList(false)}
                className="text-[#a0a0b0] hover:text-[#F0F0F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {shoppingList.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <input 
                    type="text" 
                    value={item.item}
                    onChange={(e) => handleUpdateShoppingItem(item.id, 'item', e.target.value)}
                    placeholder="Nombre del artículo"
                    className="flex-1 bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                  />
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => handleUpdateShoppingItem(item.id, 'quantity', parseInt(e.target.value))}
                    min="1"
                    className="w-16 bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-2 py-2 focus:border-[#8A2BE2] outline-none transition-colors text-center"
                  />
                  <button 
                    onClick={() => handleRemoveShoppingItem(item.id)}
                    className="text-red-500 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                className="w-full bg-[#1D1D27] hover:bg-[#3a3a4a] text-[#F0F0F0] py-2 rounded-lg border border-[#3a3a4a] transition-colors flex items-center justify-center space-x-2"
                onClick={handleAddShoppingItem}
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Artículo</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button 
                className="flex-1 bg-[#1D1D27] hover:bg-[#3a3a4a] text-[#F0F0F0] py-2 rounded-lg border border-[#3a3a4a] transition-colors"
                onClick={() => setShowShoppingList(false)}
              >
                Cerrar
              </button>
              <button className="flex-1 bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                Generar Gastos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;