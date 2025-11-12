
import React from 'react';
import useAppStore from '../../store/useAppStore';
import logo from '../../utils/logo.png';

const CashClosingTicket = ({ cashClosingDetails }) => {
  const { ticketSettings } = useAppStore();
  const { logoUrl } = ticketSettings || {};
  
  // Safely destructure with default values
  const {
    date = new Date().toISOString(),
    cashier = 'Desconocido',
    initialCash = 0,
    totalSalesAmount = 0,
    totalCashSales = 0,
    totalCardSales = 0,
    finalCash = 0,
    sales = []
  } = cashClosingDetails || {};

  return (
    <div className="bg-white p-6 font-mono text-sm text-gray-900">
      <div className="text-center mb-4">
        <img src={logoUrl || logo} alt="Company Logo" className="mx-auto h-16 mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Cierre de Caja</h2>
        <p className="text-gray-700">Fecha: {date ? new Date(date).toLocaleString() : new Date().toLocaleString()}</p>
        <p className="text-gray-700">Cajero: {cashier || 'Desconocido'}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Efectivo Inicial:</span>
          <span className="text-gray-700">${typeof initialCash === 'number' ? initialCash.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Ventas en Efectivo:</span>
          <span className="text-gray-700">${typeof totalCashSales === 'number' ? totalCashSales.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Ventas con Tarjeta:</span>
          <span className="text-gray-700">${typeof totalCardSales === 'number' ? totalCardSales.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between font-bold mt-2">
          <span className="text-gray-700">Total en Caja:</span>
          <span className="text-gray-700">${typeof finalCash === 'number' ? finalCash.toFixed(2) : '0.00'}</span>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="font-bold text-gray-900">Detalle de Ventas:</h3>
        {sales && Array.isArray(sales) ? (
          sales.length > 0 ? (
            sales.map((sale, index) => {
              const saleIdForDisplay = sale.saleId || sale.id || `sale_${index}`;
              const displayText = typeof saleIdForDisplay === 'string' && saleIdForDisplay.length > 4
                ? saleIdForDisplay.substring(saleIdForDisplay.length - 4)
                : saleIdForDisplay;
              
              return (
                <div key={sale.saleId || sale.id || `sale_${index}`} className="flex justify-between text-xs">
                  <span className="text-gray-700">Venta {displayText}:</span>
                  <span className="text-gray-700">${sale.total ? sale.total.toFixed(2) : '0.00'}</span>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-[#a0a0b0] py-1">No hay ventas registradas</div>
          )
        ) : (
          <div className="text-xs text-[#a0a0b0] py-1">Ventas no disponibles</div>
        )}
      </div>

      <div className="border-t border-gray-300 pt-2 text-center">
        <p className="text-gray-700">Gracias por su trabajo!</p>
      </div>
    </div>
  );
};

export default CashClosingTicket;
