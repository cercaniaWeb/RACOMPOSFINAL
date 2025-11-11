import React, { useEffect } from 'react';
import Router from './Router';
import useAppStore from './store/useAppStore';
import { initializeSupabaseCollections } from './utils/supabaseAPI';
import NotificationProvider from './features/notifications/NotificationProvider';

const App = () => {
  // Select state separately to prevent re-renders
  const darkMode = useAppStore(state => state.darkMode);
  // Get actions directly from the store's state outside of render to ensure stability
  const initNetworkListeners = useAppStore.getState().initNetworkListeners;
  const syncPendingOperations = useAppStore.getState().syncPendingOperations;

  useEffect(() => {
    // Initialize essential app-wide services only once on mount
    initializeSupabaseCollections();
    initNetworkListeners();
  }, []); // Empty dependency array to run only once on mount

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
    <NotificationProvider>
      <div className="min-h-screen w-full bg-[#1D1D27]">
        <div className="flex flex-col h-screen">
          <Router />
        </div>
      </div>
    </NotificationProvider>
  );
};

export default App;
