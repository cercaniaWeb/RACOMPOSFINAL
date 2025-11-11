import React from 'react';
import { X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useAppStore(); // Still accessing for compatibility but not using conditionally

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] w-full max-w-md mx-auto transition-all duration-200 relative">
        <div className="flex justify-between items-center mb-4 p-6 pb-0">
          <h2 className="text-xl font-bold text-[#F0F0F0]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#3a3a4a] text-[#a0a0b0]"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;