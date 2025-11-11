import React from 'react';
import useNotificationStore from '../store/useNotificationStore';
import NotificationItem from './NotificationItem';

const NotificationContainer = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const handleDismiss = (id) => {
    removeNotification(id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            {...notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
