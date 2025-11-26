import { cacheStorage, CachedArticle } from './db';

export interface StorageInfo {
  used: number;
  quota: number;
  usedPercentage: number;
  articleCount: number;
  offlineArticleCount: number;
}

export interface CacheManagementOptions {
  maxStoragePercentage: number; // Default 80%
  minArticlesToKeep: number; // Default 100
  evictionBatchSize: number; // Default 20
}

class CacheManager {
  private options: CacheManagementOptions = {
    maxStoragePercentage: 80,
    minArticlesToKeep: 100,
    evictionBatchSize: 20,
  };

  private checkInterval: NodeJS.Timeout | null = null;

  constructor(options?: Partial<CacheManagementOptions>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  // Get current storage information
  async getStorageInfo(): Promise<StorageInfo> {
    const used = await cacheStorage.getStorageSize();
    const quota = await cacheStorage.getStorageQuota();
    const usedPercentage = quota > 0 ? (used / quota) * 100 : 0;
    const articleCount = await cacheStorage.getArticleCount();
    const offlineArticles = await cacheStorage.getOfflineArticles();

    return {
      used,
      quota,
      usedPercentage,
      articleCount,
      offlineArticleCount: offlineArticles.length,
    };
  }

  // Check if storage needs cleanup
  async needsCleanup(): Promise<boolean> {
    const info = await this.getStorageInfo();
    return info.usedPercentage > this.options.maxStoragePercentage;
  }

  // Perform LRU eviction
  async performEviction(): Promise<number> {
    const info = await this.getStorageInfo();

    // Don't evict if we're below the minimum article count
    if (info.articleCount <= this.options.minArticlesToKeep) {
      return 0;
    }

    // Calculate how many articles to evict
    const articlesToEvict = Math.min(
      this.options.evictionBatchSize,
      info.articleCount - this.options.minArticlesToKeep
    );

    if (articlesToEvict <= 0) {
      return 0;
    }

    // Evict least recently accessed articles
    await cacheStorage.evictLRUArticles(articlesToEvict);

    return articlesToEvict;
  }

  // Auto cleanup when storage is full
  async autoCleanup(): Promise<void> {
    if (await this.needsCleanup()) {
      const evicted = await this.performEviction();
      console.log(`Auto cleanup: evicted ${evicted} articles`);
    }
  }

  // Mark article for offline availability
  async markForOffline(articleId: string): Promise<void> {
    await cacheStorage.markArticleForOffline(articleId, true);
  }

  // Unmark article from offline availability
  async unmarkForOffline(articleId: string): Promise<void> {
    await cacheStorage.markArticleForOffline(articleId, false);
  }

  // Get all offline articles
  async getOfflineArticles(): Promise<CachedArticle[]> {
    return await cacheStorage.getOfflineArticles();
  }

  // Get articles that can be evicted (oldest, not marked for offline)
  async getEvictableArticles(limit: number = 20): Promise<CachedArticle[]> {
    return await cacheStorage.getOldestCachedArticles(limit);
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    await cacheStorage.clearAllCache();
  }

  // Clear cache except offline articles
  async clearCacheExceptOffline(): Promise<void> {
    const offlineArticles = await cacheStorage.getOfflineArticles();
    const offlineIds = new Set(offlineArticles.map((a) => a.id));

    const allArticles = await cacheStorage.getCachedArticles();
    const articlesToDelete = allArticles.filter((a) => !offlineIds.has(a.id));

    for (const article of articlesToDelete) {
      await cacheStorage.removeCachedArticle(article.id);
    }
  }

  // Start periodic cleanup check (every 5 minutes)
  startPeriodicCleanup(): void {
    if (this.checkInterval) {
      return;
    }

    this.checkInterval = setInterval(
      () => {
        this.autoCleanup();
      },
      5 * 60 * 1000
    ); // 5 minutes
  }

  // Stop periodic cleanup
  stopPeriodicCleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    storage: StorageInfo;
    formattedUsed: string;
    formattedQuota: string;
    evictableCount: number;
  }> {
    const storage = await this.getStorageInfo();
    const evictableArticles = await this.getEvictableArticles();

    return {
      storage,
      formattedUsed: this.formatBytes(storage.used),
      formattedQuota: this.formatBytes(storage.quota),
      evictableCount: evictableArticles.length,
    };
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Start periodic cleanup
cacheManager.startPeriodicCleanup();
