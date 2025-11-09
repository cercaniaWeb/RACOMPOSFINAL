
import React from 'react';

const CashClosingTicket = ({ cashClosingDetails }) => {
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
    <div className="bg-white p-6 font-mono text-sm">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">Cierre de Caja</h2>
        <p>Fecha: {date ? new Date(date).toLocaleString() : new Date().toLocaleString()}</p>
        <p>Cajero: {cashier || 'Desconocido'}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-2">
        <div className="flex justify-between">
          <span>Efectivo Inicial:</span>
          <span>${typeof initialCash === 'number' ? initialCash.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span>Ventas en Efectivo:</span>
          <span>${typeof totalCashSales === 'number' ? totalCashSales.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span>Ventas con Tarjeta:</span>
          <span>${typeof totalCardSales === 'number' ? totalCardSales.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between font-bold mt-2">
          <span>Total en Caja:</span>
          <span>${typeof finalCash === 'number' ? finalCash.toFixed(2) : '0.00'}</span>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="font-bold">Detalle de Ventas:</h3>
        {sales && Array.isArray(sales) ? (
          sales.length > 0 ? (
            sales.map((sale, index) => {
              const saleIdForDisplay = sale.saleId || sale.id || `sale_${index}`;
              const displayText = typeof saleIdForDisplay === 'string' && saleIdForDisplay.length > 4
                ? saleIdForDisplay.substring(saleIdForDisplay.length - 4)
                : saleIdForDisplay;
              
              return (
                <div key={sale.saleId || sale.id || `sale_${index}`} className="flex justify-between text-xs">
                  <span>Venta {displayText}:</span>
                  <span>${sale.total ? sale.total.toFixed(2) : '0.00'}</span>
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
        <p>Gracias por su trabajo!</p>
      </div>
    </div>
  );
};

export default CashClosingTicket;
