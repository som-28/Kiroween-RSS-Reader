import { useState, useEffect } from 'react';
import {
  isServiceWorkerSupported,
  getServiceWorkerRegistration,
  updateServiceWorker,
} from '../utils/registerServiceWorker';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOfflineReady: boolean;
  needsUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Hook to monitor service worker status and provide control functions
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: isServiceWorkerSupported(),
    isRegistered: false,
    isOfflineReady: false,
    needsUpdate: false,
    registration: null,
  });

  useEffect(() => {
    // Check if service worker is registered
    const checkRegistration = async () => {
      const registration = await getServiceWorkerRegistration();
      setState((prev) => ({
        ...prev,
        isRegistered: !!registration,
        registration: registration || null,
      }));
    };

    checkRegistration();

    // Listen for offline ready event
    const handleOfflineReady = () => {
      setState((prev) => ({ ...prev, isOfflineReady: true }));
    };

    window.addEventListener('sw-offline-ready', handleOfflineReady);

    // Listen for update available event
    const handleUpdateAvailable = () => {
      setState((prev) => ({ ...prev, needsUpdate: true }));
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-offline-ready', handleOfflineReady);
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const update = async () => {
    await updateServiceWorker();
    setState((prev) => ({ ...prev, needsUpdate: false }));
  };

  return {
    ...state,
    update,
  };
}
