import React from 'react';
import { X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { darkMode } = useAppStore(); // Still accessing for compatibility but not using conditionally

  if (!isOpen) return null;

  // Define size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full mx-4'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-[#282837] rounded-xl border border-[#3a3a4a] w-full ${sizeClass} mx-auto transition-all duration-200 relative max-h-[90vh]`}>
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