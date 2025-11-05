import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ClientFormModal from '../features/clients/ClientFormModal';
import Modal from '../components/ui/Modal';

const ClientsPage = () => {
  const { addClient } = useAppStore();
  const [showClientModal, setShowClientModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  
  // Mock data for clients
  const clients = [
    { id: 1, name: 'María González', email: 'maria@email.com', phone: '+1 234 567 890', lastPurchase: '2024-01-15', total: '$2,450' },
    { id: 2, name: 'Juan Pérez', email: 'juan@email.com', phone: '+1 234 567 891', lastPurchase: '2024-01-14', total: '$1,890' },
    { id: 3, name: 'Ana Rodríguez', email: 'ana@email.com', phone: '+1 234 567 892', lastPurchase: '2024-01-13', total: '$3,200' },
    { id: 4, name: 'Carlos López', email: 'carlos@email.com', phone: '+1 234 567 893', lastPurchase: '2024-01-12', total: '$950' },
    { id: 5, name: 'Laura Martínez', email: 'laura@email.com', phone: '+1 234 567 894', lastPurchase: '2024-01-11', total: '$4,100' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Gestión de Clientes</h2>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => {
            setCurrentClient(null);
            setShowClientModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1D1D27] border-b border-[#3a3a4a]">
              <tr>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Cliente</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Email</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Teléfono</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Última Compra</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Total Gastado</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#8A2BE2] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#F0F0F0] font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#a0a0b0]">{client.email}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{client.phone}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{client.lastPurchase}</td>
                  <td className="py-4 px-6 text-[#8A2BE2] font-bold">{client.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Form Modal */}
      <Modal 
        isOpen={showClientModal}
        title={currentClient ? "Editar Cliente" : "Nuevo Cliente"} 
        onClose={() => {
          setShowClientModal(false);
          setCurrentClient(null);
        }}
      >
        <ClientFormModal 
          client={currentClient} 
          onClose={() => {
            setShowClientModal(false);
            setCurrentClient(null);
          }} 
        />
      </Modal>
    </div>
  );
};

export default ClientsPage;