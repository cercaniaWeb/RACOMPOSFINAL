import useNotificationStore from '../store/useNotificationStore';

const useNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return {
    showSuccess: (message, duration) => addNotification('success', message, duration),
    showError: (message, duration) => addNotification('error', message, duration),
    showWarning: (message, duration) => addNotification('warning', message, duration),
    showInfo: (message, duration) => addNotification('info', message, duration),
    removeNotification: removeNotification,
  };
};

export default useNotification;
