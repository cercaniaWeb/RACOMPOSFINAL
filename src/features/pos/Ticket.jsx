import React from 'react';
import useAppStore from '../../store/useAppStore';
import QRCode from 'react-qr-code';
import logo from '../../utils/logo.png';

const Ticket = ({ saleDetails }) => {
  const { cart, total, date, saleId, subtotal, discount, note } = saleDetails;
  const { ticketSettings } = useAppStore();

  const { headerText, footerText, showQrCode, fontSize, logoUrl } = ticketSettings;

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto my-4 font-mono text-${fontSize} text-gray-900`}>
      <div className="text-center mb-4">
        <img src={logoUrl || logo} alt="Store Logo" className="mx-auto h-16 mb-2" />
        <h2 className="text-lg font-bold">{headerText}</h2>
        <p>Ticket de Venta</p>
        <p className="text-xs">{new Date(date).toLocaleString()}</p>
        <p className="text-xs">Venta ID: {saleId}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-2">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.quantity} x {item.name}</span>
            <span>${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {note && (
        <div className="border-b border-gray-300 py-2 mb-2 text-left">
          <p className="text-xs font-semibold">Nota:</p>
          <p className="text-xs">{note}</p>
        </div>
      )}

      <div className="flex justify-between font-bold text-base mb-4">
        <span>SUBTOTAL</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {discount.type !== 'none' && (
        <div className="flex justify-between text-sm mb-2">
          <span>Descuento ({discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`})</span>
          <span>-${(subtotal - total).toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-base mb-4">
        <span>TOTAL</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <div className="text-center text-xs text-gray-600">
        <p>{footerText}</p>
        {showQrCode && (
          <div className="mt-2 p-2 bg-gray-100 rounded flex justify-center">
            <QRCode value={`http://your-app.com/sale/${saleId}`} size={64} level="H" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticket;