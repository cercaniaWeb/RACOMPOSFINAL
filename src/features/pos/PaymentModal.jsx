
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const PaymentModal = ({ onClose, onPayment, total }) => {
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [commissionInCash, setCommissionInCash] = useState(false);
  const [change, setChange] = useState(0);

  const cardCommission = card > 0 ? card * 0.04 : 0;
  const totalWithCommission = total + (commissionInCash ? 0 : cardCommission);

  useEffect(() => {
    const totalPaid = Number(cash) + Number(card);
    const newChange = totalPaid - totalWithCommission;
    setChange(newChange);
  }, [cash, card, totalWithCommission]);

  const handlePayment = () => {
    onPayment({ cash, card, cardCommission, commissionInCash });
  };

  return (
    <div className="p-4" data-testid="payment-modal">
      <h2 className="text-xl font-bold mb-4">Procesar Pago</h2>
      <div className="mb-4">
        <p className="text-lg font-semibold">Total a Pagar: ${total.toFixed(2)}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Efectivo</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0.00"
              className="flex-grow"
              data-testid="cash-input"
            />
            <Button onClick={() => setCash(total - card)} className="bg-gray-200 hover:bg-gray-300">Exacto</Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
          <Input
            type="number"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="0.00"
            data-testid="card-input"
          />
          {card > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Comisión (4%): ${(card * 0.04).toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  id="commissionInCash"
                  checked={commissionInCash}
                  onChange={() => setCommissionInCash(!commissionInCash)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="commissionInCash" className="ml-2 block text-sm text-gray-900">Pagar comisión en efectivo</label>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <p className={`text-lg font-semibold ${change < 0 ? 'text-red-500' : 'text-green-500'}`} data-testid="change-amount">
          Cambio: ${change.toFixed(2)}
        </p>
      </div>
      <div className="flex justify-end gap-4">
        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400">
          Cancelar
        </Button>
        <Button onClick={handlePayment} className="bg-blue-600 text-white hover:bg-blue-700" disabled={change < 0} data-testid="accept-payment-button">
          Aceptar
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
