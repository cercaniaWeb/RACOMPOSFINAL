import React, { useEffect } from 'react';
import Router from './Router';
import useAppStore from './store/useAppStore';

const App = () => {
  const { initialize, darkMode, initNetworkListeners, syncPendingOperations, isOnline } = useAppStore();

  useEffect(() => {
    initialize();
    initNetworkListeners();
  }, [initialize, initNetworkListeners]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Sync pending operations when coming back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is now online, syncing pending operations...');
      syncPendingOperations();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingOperations]);

  return (
    <div className="min-h-screen w-full bg-[#1D1D27]">
      <div className="flex flex-col h-screen">
        <Router />
      </div>
    </div>
  );
};

export default App;
