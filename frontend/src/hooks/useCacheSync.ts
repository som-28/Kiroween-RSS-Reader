import { useEffect, useState } from 'react';
import { syncService } from '../services/syncService';
import { cacheStorage } from '../services/db';

export interface CacheSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperationsCount: number;
  lastSyncTime: Date | null;
}

export function useCacheSync() {
  const [status, setStatus] = useState<CacheSyncStatus>({
    isOnline: syncService.getOnlineStatus(),
    isSyncing: false,
    pendingOperationsCount: 0,
    lastSyncTime: null,
  });

  useEffect(() => {
    // Subscribe to online status changes
    const unsubscribe = syncService.subscribe((isOnline) => {
      setStatus((prev) => ({ ...prev, isOnline }));
    });

    // Update pending operations count
    const updatePendingCount = async () => {
      const operations = await cacheStorage.getPendingOperations();
      setStatus((prev) => ({ ...prev, pendingOperationsCount: operations.length }));
    };

    // Initial count
    updatePendingCount();

    // Poll for pending operations count every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const manualSync = async () => {
    if (!status.isOnline) {
      return;
    }

    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      await syncService.syncPendingOperations();
      const operations = await cacheStorage.getPendingOperations();
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        pendingOperationsCount: operations.length,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      console.error('Manual sync failed:', error);
      setStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  return {
    ...status,
    manualSync,
  };
}
