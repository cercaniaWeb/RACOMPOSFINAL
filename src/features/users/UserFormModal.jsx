import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const UserFormModal = ({ user, onClose, onSuccess }) => {
  const { addUser, updateUser, stores } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cajera',
    storeId: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'cajera',
        storeId: user.storeId || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'cajera',
        storeId: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      ...formData
    };
    
    // Only include password if it's a new user or a new password is provided
    if (!user && formData.password) {
      userData.password = formData.password;
    } else if (user && formData.password) {
      // For existing users, only update password if a new one is provided
      userData.password = formData.password;
    }
    
    try {
      if (user) {
        // Update existing user
        await updateUser(user.id, userData);
      } else {
        // Add new user
        await addUser(userData);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-[#282837] rounded-xl border border-[#3a3a4a]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#F0F0F0]">
          {user ? 'Editar Usuario' : 'Agregar Usuario'}
        </h3>
        <button 
          onClick={onClose}
          className="text-[#a0a0b0] hover:text-[#F0F0F0]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Nombre *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
            {user ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            placeholder={user ? "Dejar vacío para mantener contraseña actual" : "Contraseña del usuario"}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Rol *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
          >
            <option value="cajera">Cajera</option>
            <option value="gerente">Gerente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1">Tienda</label>
          <select
            name="storeId"
            value={formData.storeId}
            onChange={handleChange}
            className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
          >
            <option value="">Selecciona una tienda</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#3a3a4a] text-[#F0F0F0] hover:bg-[#4a4a5a] py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-[#8A2BE2] text-white hover:bg-[#7a1bd2] py-2 px-4 rounded-lg"
          >
            {user ? 'Actualizar Usuario' : 'Agregar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormModal;