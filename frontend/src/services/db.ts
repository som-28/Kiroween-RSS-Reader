import Dexie, { Table } from 'dexie';

// Types for cached data
export interface CachedFeed {
  id: string;
  url: string;
  title: string;
  description: string | null;
  lastFetched: Date | null;
  fetchInterval: number;
  status: 'active' | 'error' | 'paused';
  errorMessage: string | null;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
  cachedAt: Date;
}

export interface CachedArticle {
  id: string;
  feedId: string;
  title: string;
  link: string;
  content: string;
  excerpt: string | null;
  author: string | null;
  publishedAt: Date;
  fetchedAt: Date;
  summary: string | null;
  topics: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  relevanceScore: number;
  isRead: boolean;
  isFavorite: boolean;
  userFeedback: 'like' | 'dislike' | null;
  audioUrl: string | null;
  audioDuration: number | null;
  cachedAt: Date;
  markedForOffline: boolean;
  lastAccessedAt: Date;
}

export interface CachedDigest {
  id: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  articleIds: string[];
  summary: string;
  topTopics: string[];
  type: 'daily' | 'weekly' | 'custom';
  cachedAt: Date;
}

export interface PendingOperation {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'feed' | 'article' | 'preferences' | 'digest';
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface CacheMetadata {
  key: string;
  value: string | number | boolean;
  updatedAt: Date;
}

// Dexie database class
class HauntedRSSDatabase extends Dexie {
  feeds!: Table<CachedFeed, string>;
  articles!: Table<CachedArticle, string>;
  digests!: Table<CachedDigest, string>;
  pendingOperations!: Table<PendingOperation, number>;
  metadata!: Table<CacheMetadata, string>;

  constructor() {
    super('HauntedRSSDatabase');

    this.version(1).stores({
      feeds: 'id, url, status, cachedAt',
      articles:
        'id, feedId, publishedAt, cachedAt, markedForOffline, lastAccessedAt, relevanceScore',
      digests: 'id, generatedAt, type, cachedAt',
      pendingOperations: '++id, type, entity, entityId, timestamp',
      metadata: 'key',
    });
  }
}

// Create and export database instance
export const db = new HauntedRSSDatabase();

// Cache storage functions
export const cacheStorage = {
  // Feed operations
  async cacheFeed(feed: Omit<CachedFeed, 'cachedAt'>): Promise<void> {
    await db.feeds.put({
      ...feed,
      cachedAt: new Date(),
    });
  },

  async cacheFeeds(feeds: Omit<CachedFeed, 'cachedAt'>[]): Promise<void> {
    const cachedFeeds = feeds.map((feed) => ({
      ...feed,
      cachedAt: new Date(),
    }));
    await db.feeds.bulkPut(cachedFeeds);
  },

  async getCachedFeed(id: string): Promise<CachedFeed | undefined> {
    return await db.feeds.get(id);
  },

  async getCachedFeeds(): Promise<CachedFeed[]> {
    return await db.feeds.toArray();
  },

  async removeCachedFeed(id: string): Promise<void> {
    await db.feeds.delete(id);
  },

  // Article operations
  async cacheArticle(article: Omit<CachedArticle, 'cachedAt' | 'lastAccessedAt'>): Promise<void> {
    const now = new Date();
    await db.articles.put({
      ...article,
      cachedAt: now,
      lastAccessedAt: now,
    });
  },

  async cacheArticles(
    articles: Omit<CachedArticle, 'cachedAt' | 'lastAccessedAt'>[]
  ): Promise<void> {
    const now = new Date();
    const cachedArticles = articles.map((article) => ({
      ...article,
      cachedAt: now,
      lastAccessedAt: now,
    }));
    await db.articles.bulkPut(cachedArticles);
  },

  async getCachedArticle(id: string): Promise<CachedArticle | undefined> {
    const article = await db.articles.get(id);
    if (article) {
      // Update last accessed time
      await db.articles.update(id, { lastAccessedAt: new Date() });
    }
    return article;
  },

  async getCachedArticles(feedId?: string): Promise<CachedArticle[]> {
    if (feedId) {
      return await db.articles.where('feedId').equals(feedId).toArray();
    }
    return await db.articles.toArray();
  },

  async getCachedArticlesByIds(ids: string[]): Promise<CachedArticle[]> {
    return await db.articles.where('id').anyOf(ids).toArray();
  },

  async removeCachedArticle(id: string): Promise<void> {
    await db.articles.delete(id);
  },

  async markArticleForOffline(id: string, marked: boolean): Promise<void> {
    await db.articles.update(id, { markedForOffline: marked });
  },

  async getOfflineArticles(): Promise<CachedArticle[]> {
    return await db.articles.where('markedForOffline').equals(1).toArray();
  },

  // Digest operations
  async cacheDigest(digest: Omit<CachedDigest, 'cachedAt'>): Promise<void> {
    await db.digests.put({
      ...digest,
      cachedAt: new Date(),
    });
  },

  async getCachedDigest(id: string): Promise<CachedDigest | undefined> {
    return await db.digests.get(id);
  },

  async getCachedDigests(): Promise<CachedDigest[]> {
    return await db.digests.orderBy('generatedAt').reverse().toArray();
  },

  async getLatestCachedDigest(): Promise<CachedDigest | undefined> {
    return await db.digests.orderBy('generatedAt').reverse().first();
  },

  async removeCachedDigest(id: string): Promise<void> {
    await db.digests.delete(id);
  },

  // Pending operations (for offline queue)
  async addPendingOperation(
    operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<number> {
    return await db.pendingOperations.add({
      ...operation,
      timestamp: new Date(),
      retryCount: 0,
    });
  },

  async getPendingOperations(): Promise<PendingOperation[]> {
    return await db.pendingOperations.orderBy('timestamp').toArray();
  },

  async removePendingOperation(id: number): Promise<void> {
    await db.pendingOperations.delete(id);
  },

  async incrementRetryCount(id: number): Promise<void> {
    const operation = await db.pendingOperations.get(id);
    if (operation) {
      await db.pendingOperations.update(id, { retryCount: operation.retryCount + 1 });
    }
  },

  async clearPendingOperations(): Promise<void> {
    await db.pendingOperations.clear();
  },

  // Metadata operations
  async setMetadata(key: string, value: string | number | boolean): Promise<void> {
    await db.metadata.put({
      key,
      value,
      updatedAt: new Date(),
    });
  },

  async getMetadata(key: string): Promise<string | number | boolean | undefined> {
    const metadata = await db.metadata.get(key);
    return metadata?.value;
  },

  // Storage management
  async getStorageSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  },

  async getStorageQuota(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.quota || 0;
    }
    return 0;
  },

  async clearAllCache(): Promise<void> {
    await db.feeds.clear();
    await db.articles.clear();
    await db.digests.clear();
    await db.pendingOperations.clear();
    await db.metadata.clear();
  },

  // LRU eviction - remove least recently accessed articles
  async evictLRUArticles(count: number): Promise<void> {
    const articles = await db.articles
      .orderBy('lastAccessedAt')
      .filter((article) => !article.markedForOffline)
      .limit(count)
      .toArray();

    const idsToDelete = articles.map((a) => a.id);
    await db.articles.bulkDelete(idsToDelete);
  },

  async getArticleCount(): Promise<number> {
    return await db.articles.count();
  },

  async getOldestCachedArticles(limit: number): Promise<CachedArticle[]> {
    return await db.articles
      .orderBy('lastAccessedAt')
      .filter((article) => !article.markedForOffline)
      .limit(limit)
      .toArray();
  },
};
