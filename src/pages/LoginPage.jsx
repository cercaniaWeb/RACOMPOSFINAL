import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShoppingCart } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleLogin } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await handleLogin(email, password);
    if (result.success) {
      if (result.user.role === 'admin' || result.user.role === 'gerente') {
        navigate('/admin');
      } else if (result.user.role === 'cajera') {
        navigate('/pos/1'); // Assuming storeId 1 for now
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D1D27] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/src/utils/logopos.png" 
              alt="Logo RACOM POS" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold text-[#F0F0F0]">RACOM POS</h1>
          </div>
          <p className="text-[#a0a0b0]">Sistema de Punto de Venta</p>
        </div>

        <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#a0a0b0] mb-2">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu email"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-3 focus:border-[#8A2BE2] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a0a0b0] mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-3 focus:border-[#8A2BE2] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {error && ( // Display error message
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a0a0b0] text-sm">
              ¿No recuerdas tus credenciales? Contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;