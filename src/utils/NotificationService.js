// NotificationService.js
class NotificationService {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Crear un contenedor global para notificaciones si no existe
    if (!document.getElementById('notification-container')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notification-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    
    // Asignar estilos según el tipo de notificación
    let bgColor = 'bg-gray-800';
    if (type === 'success') bgColor = 'bg-green-600';
    if (type === 'error') bgColor = 'bg-red-600';
    if (type === 'warning') bgColor = 'bg-yellow-600';
    if (type === 'info') bgColor = 'bg-blue-600';
    
    notification.className = `notification-item px-4 py-3 rounded-lg shadow-lg text-white max-w-xs ${bgColor} flex items-start`;
    notification.innerHTML = `
      <div class="flex-1">${message}</div>
      <button class="ml-3 text-white opacity-70 hover:opacity-100 text-xl">×</button>
    `;

    // Añadir al contenedor
    this.container.appendChild(notification);

    // Añadir funcionalidad para cerrar al hacer clic en ×
    const closeBtn = notification.querySelector('button');
    closeBtn.onclick = () => {
      notification.remove();
    };

    // Eliminar automáticamente después de la duración especificada
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }

  // Métodos abreviados
  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

// Crear instancia global
export const notificationService = new NotificationService();
export default notificationService;