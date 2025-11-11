import React from 'react';
import NotificationContainer from './components/NotificationContainer';

const NotificationProvider = ({ children }) => {
  return (
    <>
      {children}
      <NotificationContainer />
    </>
  );
};

export default NotificationProvider;
