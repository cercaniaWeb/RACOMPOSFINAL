
import React, { useState, useRef } from 'react';
import useAppStore from '../../store/useAppStore'; 
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import CashClosingTicket from './CashClosingTicket'; // Import the ticket component
import { useReactToPrint } from 'react-to-print';

const CashClosingModal = ({ onClose }) => {
  const { salesHistory, currentUser, cashClosings, addCashClosing } = useAppStore();
  const [initialCash, setInitialCash] = useState(0);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const ticketRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
  });

  const salesToClose = salesHistory.filter(sale => 
    (sale.userId === currentUser?.id || 
    sale.userId === currentUser?.userId || 
    sale.cashierId === currentUser?.id || 
    sale.cashier === currentUser?.name || 
    sale.cashier === currentUser?.displayName) &&
    (sale.status !== 'closed') // Only include non-closed sales
  ); // Changed to match possible store data field names
  
  const totalSalesAmount = salesToClose.reduce((acc, sale) => acc + (sale.total || sale.subtotal || sale.amount || 0), 0);
  const totalCashSales = salesToClose.filter(sale => 
    (!sale.paymentMethod || 
    sale.paymentMethod === 'cash' || 
    sale.paymentMethod === 'efectivo' || 
    (sale.paymentMethod && sale.paymentMethod.toLowerCase().includes('cash')))
  ).reduce((acc, sale) => acc + (sale.total || sale.subtotal || sale.amount || 0), 0);
  
  const totalCardSales = salesToClose.filter(sale => 
    (sale.paymentMethod === 'card' || 
    sale.paymentMethod === 'tarjeta' || 
    (sale.paymentMethod && sale.paymentMethod.toLowerCase().includes('card')))
  ).reduce((acc, sale) => acc + (sale.total || sale.subtotal || sale.amount || 0), 0);

  const finalCash = initialCash + totalCashSales;

  // Map the sales to ensure they have proper IDs
  const salesWithIds = salesToClose.map(sale => ({
    ...sale,
    saleId: sale.id || sale.saleId || sale._id || sale.saleId || Math.random().toString(36).substr(2, 9)
  }));

  const cashClosingData = {
    date: new Date().toISOString(),
    cashier: currentUser?.name || currentUser?.displayName,
    initialCash: parseFloat(initialCash) || 0,
    totalSalesAmount: totalSalesAmount,
    totalCashSales: totalCashSales,
    totalCardSales: totalCardSales,
    finalCash: finalCash,
    sales: salesWithIds,
  };

  const handleCloseCash = () => {
    // Call the store function to save the cash closing if it exists
    if (addCashClosing && typeof addCashClosing === 'function') {
      addCashClosing(cashClosingData);
      // Show the ticket preview after saving
      setShowTicketPreview(true);
    } else {
      console.error('addCashClosing function is not available in store');
      onClose();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[#F0F0F0]">Cierre de Caja</h2>
      <p className="mb-4 text-[#F0F0F0]">Usuario: {currentUser?.name || currentUser?.displayName || 'Desconocido'}</p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Efectivo Inicial en Caja</label>
        <Input
          type="number"
          value={initialCash}
          onChange={(e) => setInitialCash(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-md py-2 px-3"
        />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-[#a0a0b0]">Ventas en Efectivo:</p>
          <p className="font-semibold text-[#F0F0F0]">${totalCashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-[#a0a0b0]">Ventas con Tarjeta:</p>
          <p className="font-semibold text-[#F0F0F0]">${totalCardSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-[#a0a0b0]">Total de ventas:</p>
          <p className="font-semibold text-[#F0F0F0]">{salesToClose.length || 0}</p>
        </div>
        <div>
          <p className="text-sm text-[#a0a0b0]">Monto total ventas:</p>
          <p className="font-semibold text-[#F0F0F0]">${totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="mb-6 p-3 bg-[#1D1D27] rounded-lg border border-[#3a3a4a]">
        <p className="text-sm text-[#a0a0b0]">Total en Caja:</p>
        <p className="text-xl font-bold text-[#8A2BE2]">${finalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-xs text-[#a0a0b0] mt-1">(Efectivo Inicial + Ventas Efectivo)</p>
      </div>
      <div className="flex space-x-3">
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="flex-1 text-[#F0F0F0] border-[#3a3a4a] hover:bg-[#3a3a4a]"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleCloseCash} 
          className="flex-1 bg-[#8A2BE2] hover:bg-purple-700 text-white"
        >
          Cerrar Caja
        </Button>
      </div>
      
      {/* Ticket Preview Modal */}
      <Modal 
        isOpen={showTicketPreview} 
        onClose={() => {
          setShowTicketPreview(false);
          onClose();
        }} 
        title="Ticket de Cierre de Caja"
      >
        <div className="max-h-[70vh] overflow-auto">
          <CashClosingTicket 
            ref={ticketRef} 
            cashClosingDetails={cashClosingData} 
          />
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <Button 
            onClick={handlePrint} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Imprimir Ticket
          </Button>
          <Button 
            onClick={() => {
              setShowTicketPreview(false);
              onClose();
            }} 
            className="bg-gray-300 hover:bg-gray-400"
          >
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CashClosingModal;
