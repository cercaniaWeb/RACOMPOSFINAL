import React from 'react';
import { X } from 'lucide-react';
import QRCode from 'qrcode.react';

const TicketModal = ({ sale, onClose }) => {
  if (!sale) return null;

  const saleDataString = JSON.stringify(sale);
  const receiptUrl = `${window.location.origin}/receipt?data=${encodeURIComponent(saleDataString)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-black">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold">Recibo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">¡Gracias por su compra!</h3>
          <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleString()}</p>
        </div>

        <div className="space-y-2 mb-4">
          {sale.cart.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>${sale.subtotal.toFixed(2)}</span>
          </div>
          {sale.discount.value > 0 && (
            <div className="flex justify-between text-sm">
              <span>Descuento</span>
              <span>-${sale.discount.type === 'percentage' ? `${sale.discount.value}%` : `$${sale.discount.value.toFixed(2)}`}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>${sale.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <QRCode value={receiptUrl} size={128} />
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Escanea para ver tu recibo digital</p>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
