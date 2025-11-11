import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  addNotification: (type, message, duration = 5000) => {
    const id = uuidv4();
    const newNotification = { id, type, message, duration };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Automatically remove notification after duration
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));

export default useNotificationStore;
