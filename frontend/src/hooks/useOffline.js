import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const setOfflineStore = useUIStore((state) => state.setOffline);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setOfflineStore(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setOfflineStore(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineStore]);

  return { isOffline };
};
