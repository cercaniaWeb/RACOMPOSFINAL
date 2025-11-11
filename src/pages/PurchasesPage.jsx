import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import useAppStore from '../store/useAppStore';
import ExpenseForm from '../features/purchases/ExpenseForm';

const PurchasesPage = () => {
  const { expenses } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Gastos Misceláneos</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white hover:bg-green-700">
          Registrar Gasto Misceláneo
        </Button>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Historial de Gastos</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No hay gastos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Gasto Misceláneo">
        <ExpenseForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default PurchasesPage;