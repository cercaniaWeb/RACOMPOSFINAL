import React from 'react';
import { useLocation } from 'react-router-dom';

const ReceiptPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const saleDataString = params.get('data');

  let sale = null;
  try {
    if (saleDataString) {
      sale = JSON.parse(decodeURIComponent(saleDataString));
    }
  } catch (error) {
    console.error("Error parsing sale data:", error);
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-700">No se pudo cargar el recibo. El enlace puede ser inválido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 my-8">
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold">Detalle de la Compra</h1>
          <p className="text-gray-600 mt-2">{new Date(sale.date).toLocaleString()}</p>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold border-b pb-2">Artículos</h2>
          {sale.cart.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 space-y-3">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">${sale.subtotal.toFixed(2)}</span>
          </div>
          {sale.discount.value > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Descuento</span>
              <span>-${sale.discount.type === 'percentage' ? `${sale.discount.value}%` : `$${sale.discount.value.toFixed(2)}`}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-2xl text-gray-800">
            <span>Total</span>
            <span>${sale.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-500">
          <p>Gracias por su preferencia.</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
