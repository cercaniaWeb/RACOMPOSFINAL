import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { Check, Send, Package } from 'lucide-react';
import useNotification from '../features/notifications/hooks/useNotification';

const TransferDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transfers, currentUser, confirmTransferShipment, confirmTransferReception } = useAppStore();
  const { showSuccess, showError } = useNotification();
  const transfer = transfers.find(t => t.id === id);

  const [sentItems, setSentItems] = useState({});
  const [receivedItems, setReceivedItems] = useState({});

  if (!transfer) {
    return <div className="p-6 text-white">Transfer not found.</div>;
  }

  const handleConfirmShipment = () => {
    if (Object.keys(sentItems).length !== transfer.items.length) {
      showError('Debes especificar la cantidad enviada para todos los productos.');
      return;
    }
    confirmTransferShipment(id, Object.entries(sentItems).map(([productId, quantity]) => ({ productId, quantity })));
    showSuccess('Envío confirmado exitosamente.');
    navigate('/transfers');
  };

  const handleConfirmReception = () => {
    if (Object.keys(receivedItems).length !== transfer.items.length) {
      showError('Debes especificar la cantidad recibida para todos los productos.');
      return;
    }
    confirmTransferReception(id, Object.entries(receivedItems).map(([productId, quantity]) => ({ productId, quantity })));
    showSuccess('Recepción confirmada exitosamente.');
    navigate('/transfers');
  };

  const canConfirmShipment = transfer.status === 'solicitado' && (currentUser.role === 'admin' || currentUser.storeId === transfer.originLocationId);
  const canConfirmReception = transfer.status === 'enviado' && (currentUser.role === 'admin' || currentUser.storeId === transfer.destinationLocationId);

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27] text-white">
      <h2 className="text-2xl font-bold">Detalles del Traslado #{transfer.id}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#282837] p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Origen</h3>
          <p>{transfer.originLocationId}</p>
        </div>
        <div className="bg-[#282837] p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Destino</h3>
          <p>{transfer.destinationLocationId}</p>
        </div>
        <div className="bg-[#282837] p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Estado</h3>
          <p className="capitalize">{transfer.status}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Artículos</h3>
        <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1D1D27]">
              <tr>
                <th className="p-4 text-left">Producto</th>
                <th className="p-4 text-left">Solicitado</th>
                {transfer.status !== 'solicitado' && <th className="p-4 text-left">Enviado</th>}
                {transfer.status === 'recibido' && <th className="p-4 text-left">Recibido</th>}
              </tr>
            </thead>
            <tbody>
              {transfer.items.map(item => (
                <tr key={item.productId} className="border-t border-[#3a3a4a]">
                  <td className="p-4">{item.productName}</td>
                  <td className="p-4">{item.requestedQuantity}</td>
                  {transfer.status !== 'solicitado' && <td className="p-4">{item.sentQuantity || 0}</td>}
                  {transfer.status === 'recibido' && <td className="p-4">{item.receivedQuantity || 0}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canConfirmShipment && (
        <div>
          <h3 className="text-xl font-bold mb-4">Confirmar Envío</h3>
          {transfer.items.map(item => (
            <div key={item.productId} className="flex items-center gap-4 mb-2">
              <span className="flex-1">{item.productName}</span>
              <input
                type="number"
                max={item.requestedQuantity}
                placeholder="Cantidad enviada"
                onChange={(e) => setSentItems({...sentItems, [item.productId]: parseInt(e.target.value, 10)})}
                className="w-32 bg-[#1D1D27] text-white border border-[#3a3a4a] rounded-lg p-2"
              />
            </div>
          ))}
          <button onClick={handleConfirmShipment} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
            <Send className="w-4 h-4" /> Confirmar Envío
          </button>
        </div>
      )}

      {canConfirmReception && (
        <div>
          <h3 className="text-xl font-bold mb-4">Confirmar Recepción</h3>
          {transfer.items.map(item => (
            <div key={item.productId} className="flex items-center gap-4 mb-2">
              <span className="flex-1">{item.productName}</span>
              <input
                type="number"
                max={item.sentQuantity}
                placeholder="Cantidad recibida"
                onChange={(e) => setReceivedItems({...receivedItems, [item.productId]: parseInt(e.target.value, 10)})}
                className="w-32 bg-[#1D1D27] text-white border border-[#3a3a4a] rounded-lg p-2"
              />
            </div>
          ))}
          <button onClick={handleConfirmReception} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4" /> Confirmar Recepción
          </button>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-4">Historial</h3>
        <div className="space-y-2">
          {transfer.history.map((entry, index) => (
            <div key={index} className="bg-[#282837] p-3 rounded-lg">
              <p><strong>Estado:</strong> {entry.status}</p>
              <p><strong>Fecha:</strong> {new Date(entry.date).toLocaleString()}</p>
              <p><strong>Usuario:</strong> {entry.userId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransferDetailsPage;
