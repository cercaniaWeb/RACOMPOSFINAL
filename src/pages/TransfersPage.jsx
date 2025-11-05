import React, { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import TransferFormModal from '../features/transfers/TransferFormModal';
import Modal from '../components/ui/Modal';

const TransfersPage = () => {
  const { currentUser } = useAppStore();
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Mock data for transfers
  const transfersToSend = [
    { id: 1, origin: 'Sucursal Central', destination: 'Sucursal Norte', products: 5, amount: '$2,450', time: 'Hace 2 horas' },
    { id: 2, origin: 'Sucursal Central', destination: 'Sucursal Sur', products: 3, amount: '$1,200', time: 'Hace 5 horas' },
    { id: 3, origin: 'Bodega', destination: 'Sucursal Central', products: 8, amount: '$3,680', time: 'Hace 1 día' },
  ];

  const transfersToReceive = [
    { id: 4, origin: 'Sucursal Sur', destination: 'Sucursal Central', products: 3, amount: '$1,200', time: 'Hace 1 día' },
    { id: 5, origin: 'Bodega', destination: 'Sucursal Norte', products: 6, amount: '$2,100', time: 'Hace 2 días' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Órdenes de Traslado</h2>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => setShowTransferModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Crear Solicitud</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfers to Send */}
        <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
          <h3 className="text-lg font-bold text-[#F0F0F0] mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Traslados por Enviar</span>
          </h3>
          <div className="space-y-4">
            {transfersToSend.map((transfer) => (
              <div key={transfer.id} className="bg-[#1D1D27] rounded-lg p-4 border border-[#3a3a4a]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#F0F0F0] font-medium">TR-{String(transfer.id).padStart(4, '0')}</span>
                  <span className="text-[#a0a0b0] text-sm">{transfer.time}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#F0F0F0]">{transfer.origin} → {transfer.destination}</p>
                    <p className="text-[#a0a0b0] text-sm">{transfer.products} productos</p>
                  </div>
                  <span className="text-yellow-500 font-bold">{transfer.amount}</span>
                </div>
                <button className="w-full bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                  Preparar Envío
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transfers to Receive */}
        <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
          <h3 className="text-lg font-bold text-[#F0F0F0] mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Traslados por Recibir</span>
          </h3>
          <div className="space-y-4">
            {transfersToReceive.map((transfer) => (
              <div key={transfer.id} className="bg-[#1D1D27] rounded-lg p-4 border border-[#3a3a4a]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#F0F0F0] font-medium">TR-{String(transfer.id).padStart(4, '0')}</span>
                  <span className="text-[#a0a0b0] text-sm">{transfer.time}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#F0F0F0]">{transfer.origin} → {transfer.destination}</p>
                    <p className="text-[#a0a0b0] text-sm">{transfer.products} productos</p>
                  </div>
                  <span className="text-green-500 font-bold">{transfer.amount}</span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                  Confirmar Recepción
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Form Modal */}
      <Modal 
        isOpen={showTransferModal}
        title="Crear Solicitud de Traslado" 
        onClose={() => setShowTransferModal(false)}
      >
        <TransferFormModal 
          onClose={() => setShowTransferModal(false)} 
          currentUser={currentUser}
        />
      </Modal>
    </div>
  );
};

export default TransfersPage;