
import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1D1D27] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Acceso Denegado</h1>
        <p className="text-[#a0a0b0] mb-6">
          No tienes permiso para ver esta página. Contacta al administrador si crees que esto es un error.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
