// Database and cache storage
export { db, cacheStorage } from './db';
export type {
  CachedFeed,
  CachedArticle,
  CachedDigest,
  PendingOperation,
  CacheMetadata,
} from './db';

// Sync service
export { syncService, useOnlineStatus } from './syncService';

// Cache manager
export { cacheManager } from './cacheManager';
export type { StorageInfo, CacheManagementOptions } from './cacheManager';

// Notification service
export { notificationService } from './notificationService';
export type { NotificationData, NotificationPermission } from './notificationService';

// Feed service
export { feedService } from './feedService';
export type { Feed, CreateFeedInput, UpdateFeedInput } from './feedService';

// Article service
export { articleService } from './articleService';
export type { ArticleFeedbackInput, UpdateArticleInput } from './articleService';

// Digest service
export { digestService } from './digestService';
export type {
  Digest,
  DigestWithArticles,
  DigestPreferences,
  GenerateDigestInput,
} from './digestService';

// Search service
export { searchService } from './searchService';
export type { SearchFilters, SearchResult, SearchSuggestion } from './searchService';

// Preferences service
export { preferencesService } from './preferencesService';
export type { UserPreferences, UpdatePreferencesInput } from './preferencesService';
