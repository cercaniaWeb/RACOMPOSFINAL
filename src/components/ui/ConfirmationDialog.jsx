import React from 'react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción", 
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevenir que los clicks dentro del modal cierren el diálogo
      >
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-[#F0F0F0]">{title}</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-[#a0a0b0] leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="px-6 pt-4 pb-6 border-t border-[#3a3a4a] flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="bg-[#3a3a4a] text-[#F0F0F0] hover:bg-[#4a4a5a] py-2 px-4 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;