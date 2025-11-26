import { apiClient } from './apiClient';

/**
 * Queued operation interface
 */
export interface QueuedOperation {
  id: string;
  type: 'mutation';
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Offline queue status
 */
export type QueueStatus = 'idle' | 'syncing' | 'error';

/**
 * Offline queue manager for handling operations when offline
 */
class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private status: QueueStatus = 'idle';
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: QueueStatus, queueSize: number) => void> = new Set();
  private readonly STORAGE_KEY = 'haunted-offline-queue';
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
    this.setupBackgroundSync();
  }

  /**
   * Setup background sync with service worker
   */
  private setupBackgroundSync(): void {
    // Register for background sync if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          console.log('[OfflineQueue] Service worker ready for background sync');
          // Listen for sync events from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_COMPLETE') {
              console.log('[OfflineQueue] Background sync completed');
              this.syncQueue();
            }
          });
        })
        .catch((error) => {
          console.error('[OfflineQueue] Service worker not available:', error);
        });
    }
  }

  /**
   * Request background sync via service worker
   * Note: Background Sync API may not be available in all browsers
   */
  private async requestBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Check if sync is supported (TypeScript doesn't have types for this yet)
        if ('sync' in registration) {
          await (registration as any).sync.register('sync-offline-queue');
          console.log('[OfflineQueue] Background sync registered');
        } else {
          console.log('[OfflineQueue] Background sync not supported, will sync on reconnect');
        }
      } catch (error) {
        console.error('[OfflineQueue] Failed to register background sync:', error);
      }
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Connection restored, syncing queue...');
      this.isOnline = true;
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Connection lost');
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Add an operation to the queue
   */
  public enqueue(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: any): string {
    const operation: QueuedOperation = {
      id: this.generateId(),
      type: 'mutation',
      method,
      url,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    };

    this.queue.push(operation);
    this.saveQueue();
    this.notifyListeners();

    console.log(`[OfflineQueue] Queued ${method} ${url}`, operation);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncQueue();
    } else {
      // Request background sync for when connection is restored
      this.requestBackgroundSync();
    }

    return operation.id;
  }

  /**
   * Sync all queued operations
   */
  public async syncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.status = 'syncing';
    this.notifyListeners();

    console.log(`[OfflineQueue] Syncing ${this.queue.length} operations...`);

    const operations = [...this.queue];
    const failedOperations: QueuedOperation[] = [];

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        console.log(`[OfflineQueue] Successfully synced ${operation.method} ${operation.url}`);

        // Remove from queue on success
        this.queue = this.queue.filter((op) => op.id !== operation.id);
      } catch (error) {
        console.error(`[OfflineQueue] Failed to sync ${operation.method} ${operation.url}:`, error);

        operation.retryCount++;

        if (operation.retryCount >= operation.maxRetries) {
          console.error(
            `[OfflineQueue] Max retries reached for operation ${operation.id}, removing from queue`
          );
          this.queue = this.queue.filter((op) => op.id !== operation.id);
        } else {
          failedOperations.push(operation);
        }
      }
    }

    this.saveQueue();
    this.syncInProgress = false;
    this.status = failedOperations.length > 0 ? 'error' : 'idle';
    this.notifyListeners();

    if (failedOperations.length > 0) {
      console.log(`[OfflineQueue] ${failedOperations.length} operations failed, will retry later`);
    } else {
      console.log('[OfflineQueue] All operations synced successfully');
    }
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.method) {
      case 'POST':
        await apiClient.post(operation.url, operation.data);
        break;
      case 'PUT':
        await apiClient.put(operation.url, operation.data);
        break;
      case 'PATCH':
        await apiClient.patch(operation.url, operation.data);
        break;
      case 'DELETE':
        await apiClient.delete(operation.url);
        break;
    }
  }

  /**
   * Generate unique ID for operations
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current queue status
   */
  public getStatus(): { status: QueueStatus; queueSize: number; isOnline: boolean } {
    return {
      status: this.status,
      queueSize: this.queue.length,
      isOnline: this.isOnline,
    };
  }

  /**
   * Get all queued operations
   */
  public getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Clear the queue
   */
  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Remove a specific operation from the queue
   */
  public removeOperation(id: string): void {
    this.queue = this.queue.filter((op) => op.id !== id);
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Subscribe to queue status changes
   */
  public subscribe(listener: (status: QueueStatus, queueSize: number) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.status, this.queue.length);
    });
  }

  /**
   * Check if currently online
   */
  public isCurrentlyOnline(): boolean {
    return this.isOnline;
  }
}

/**
 * Export singleton instance
 */
export const offlineQueue = new OfflineQueue();
