import { cacheStorage, PendingOperation } from './db';
import axios from 'axios';

// Online/Offline status management
class SyncService {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners(true);
    this.syncPendingOperations();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners(false);
  };

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach((listener) => listener(isOnline));
  }

  // Queue operations when offline
  public async queueOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'feed' | 'article' | 'preferences' | 'digest',
    entityId: string,
    data: any
  ): Promise<void> {
    await cacheStorage.addPendingOperation({
      type,
      entity,
      entityId,
      data,
    });
  }

  // Sync pending operations when online
  public async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;

    try {
      const operations = await cacheStorage.getPendingOperations();

      for (const operation of operations) {
        try {
          await this.executeOperation(operation);
          await cacheStorage.removePendingOperation(operation.id!);
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);

          // Increment retry count
          await cacheStorage.incrementRetryCount(operation.id!);

          // Remove operation if retry count exceeds limit
          if (operation.retryCount >= 3) {
            console.error('Max retries reached, removing operation:', operation);
            await cacheStorage.removePendingOperation(operation.id!);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeOperation(operation: PendingOperation): Promise<void> {
    const { getBaseUrl } = await import('../config/api');
    const baseURL = getBaseUrl();

    switch (operation.entity) {
      case 'feed':
        await this.executeFeedOperation(operation, baseURL);
        break;
      case 'article':
        await this.executeArticleOperation(operation, baseURL);
        break;
      case 'preferences':
        await this.executePreferencesOperation(operation, baseURL);
        break;
      case 'digest':
        await this.executeDigestOperation(operation, baseURL);
        break;
    }
  }

  private async executeFeedOperation(operation: PendingOperation, baseURL: string): Promise<void> {
    switch (operation.type) {
      case 'CREATE':
        await axios.post(`${baseURL}/api/feeds`, operation.data);
        break;
      case 'UPDATE':
        await axios.put(`${baseURL}/api/feeds/${operation.entityId}`, operation.data);
        break;
      case 'DELETE':
        await axios.delete(`${baseURL}/api/feeds/${operation.entityId}`);
        break;
    }
  }

  private async executeArticleOperation(
    operation: PendingOperation,
    baseURL: string
  ): Promise<void> {
    switch (operation.type) {
      case 'UPDATE':
        await axios.put(`${baseURL}/api/articles/${operation.entityId}`, operation.data);
        break;
      case 'DELETE':
        await axios.delete(`${baseURL}/api/articles/${operation.entityId}`);
        break;
    }
  }

  private async executePreferencesOperation(
    operation: PendingOperation,
    baseURL: string
  ): Promise<void> {
    if (operation.type === 'UPDATE') {
      await axios.put(`${baseURL}/api/preferences`, operation.data);
    }
  }

  private async executeDigestOperation(
    operation: PendingOperation,
    baseURL: string
  ): Promise<void> {
    if (operation.type === 'CREATE') {
      await axios.post(`${baseURL}/api/digests/generate`, operation.data);
    }
  }

  // Periodic sync every 30 seconds when online
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingOperations();
      }
    }, 30000);
  }

  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  public cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.stopPeriodicSync();
    this.listeners.clear();
  }
}

// Create singleton instance
export const syncService = new SyncService();

// React hook for online status
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = React.useState(syncService.getOnlineStatus());

  React.useEffect(() => {
    const unsubscribe = syncService.subscribe(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

// Import React for the hook
import React from 'react';
