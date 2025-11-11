import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import CreateTransferModal from '../features/transfers/components/CreateTransferModal';

const TransfersPage = () => {
  const navigate = useNavigate();
  const { transfers, loadTransfers } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Órdenes de Traslado</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Traslado</span>
        </button>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1D1D27] border-b border-[#3a3a4a]">
              <tr>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">ID</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Origen</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Destino</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Fecha</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors">
                  <td className="py-4 px-6 text-[#F0F0F0]">{transfer.id}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{transfer.originLocationId}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{transfer.destinationLocationId}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transfer.status === 'recibido' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                      transfer.status === 'enviado' ? 'bg-blue-500 bg-opacity-20 text-blue-500' :
                      'bg-yellow-500 bg-opacity-20 text-yellow-500'
                    }`}>
                      {transfer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#a0a0b0]">{new Date(transfer.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => navigate(`/transfers/${transfer.id}`)}
                      className="text-[#a0a0b0] hover:text-[#8A2BE2]"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateTransferModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default TransfersPage;
