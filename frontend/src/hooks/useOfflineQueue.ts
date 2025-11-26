import { useEffect, useState } from 'react';
import { offlineQueue, type QueueStatus } from '../lib/offlineQueue';

/**
 * Hook to monitor offline queue status
 */
export function useOfflineQueue() {
  const [status, setStatus] = useState<QueueStatus>('idle');
  const [queueSize, setQueueSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Get initial status
    const initialStatus = offlineQueue.getStatus();
    setStatus(initialStatus.status);
    setQueueSize(initialStatus.queueSize);
    setIsOnline(initialStatus.isOnline);

    // Subscribe to status changes
    const unsubscribe = offlineQueue.subscribe((newStatus, newQueueSize) => {
      setStatus(newStatus);
      setQueueSize(newQueueSize);
    });

    // Listen to online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    status,
    queueSize,
    isOnline,
    isSyncing: status === 'syncing',
    hasError: status === 'error',
    hasPendingOperations: queueSize > 0,
    syncQueue: () => offlineQueue.syncQueue(),
    clearQueue: () => offlineQueue.clearQueue(),
  };
}
