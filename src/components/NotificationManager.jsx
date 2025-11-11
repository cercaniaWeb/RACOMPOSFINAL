import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Bell, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

// Componente de notificación individual
const NotificationItem = ({ id, type, message, title, duration, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  const typeConfig = {
    success: { icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-500' },
    error: { icon: AlertCircle, color: 'bg-red-500', textColor: 'text-red-500' },
    info: { icon: Info, color: 'bg-blue-500', textColor: 'text-blue-500' },
    warning: { icon: AlertCircle, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    pending: { icon: Bell, color: 'bg-purple-500', textColor: 'text-purple-500' }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        startClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const startClose = () => {
    setOpacity(0);
    setTimeout(() => {
      setVisible(false);
      onClose(id);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div 
      className={`mb-2 transform transition-opacity duration-300 ease-in-out flex items-center p-4 rounded-lg shadow-lg ${
        config.color
      } text-white max-w-sm w-full`}
      style={{ opacity }}
    >
      <Icon className="w-5 h-5 mr-2" />
      <div className="flex-1">
        {title && <div className="font-bold">{title}</div>}
        <div>{message}</div>
      </div>
      <button 
        onClick={startClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Provider de notificaciones global
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Agregar método global para mostrar notificaciones
    window.showNotification = (type, message, title, duration = 5000) => {
      const id = Date.now() + Math.random();
      const notification = { id, type, message, title, duration };
      setNotifications(prev => [...prev, notification]);
    };

    // Agregar método para gastos pendientes
    window.notifyPendingExpense = (expenseData) => {
      const message = `Nuevo gasto pendiente: ${expenseData.concept} - $${expenseData.amount}`;
      window.showNotification('pending', message, 'Gasto Pendiente', 10000);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Renderizar notificaciones en el portal
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>,
    document.body
  );
};

export default NotificationManager;