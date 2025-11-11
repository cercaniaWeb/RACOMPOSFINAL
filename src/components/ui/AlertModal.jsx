import React from 'react';

const AlertModal = ({ isOpen, onClose, title = "Notificación", message, type = "info", confirmText = "Aceptar" }) => {
  const typeClasses = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500"
  };

  const iconClasses = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500"
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevenir que los clicks dentro del modal cierren el diálogo
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-[#F0F0F0]">{title}</h3>
        </div>
        
        <div className="flex items-start mb-6">
          <div className={`mr-3 mt-0.5 ${iconClasses[type] ?? iconClasses.info}`}>
            <div className={`w-6 h-6 rounded-full ${typeClasses[type] ?? typeClasses.info} flex items-center justify-center`}>
              <span className="text-white text-sm">
                {type === "error" ? "!" : type === "warning" ? "!" : type === "success" ? "✓" : "i"}
              </span>
            </div>
          </div>
          <p className="text-[#a0a0b0]">{message}</p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`bg-[#8A2BE2] hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors ${typeClasses[type] ?? typeClasses.info}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;