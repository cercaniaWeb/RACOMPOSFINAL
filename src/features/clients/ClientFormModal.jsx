import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ClientFormModal = ({ client, onClose }) => {
  const { addClient, updateClient } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 0,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        creditLimit: client.creditLimit || 0,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 0,
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (client) {
        // Update existing client
        await updateClient(client.id, formData);
      } else {
        // Add new client
        await addClient(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
        <Input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">Límite de Crédito</label>
        <Input
          id="creditLimit"
          name="creditLimit"
          type="number"
          value={formData.creditLimit}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {client ? "Actualizar Cliente" : "Agregar Cliente"}
        </Button>
      </div>
    </form>
  );
};

export default ClientFormModal;