import { QueryClient } from '@tanstack/react-query';

/**
 * Configure React Query client with optimized settings
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Exponential backoff for mutation retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  // Feed queries
  feeds: ['feeds'] as const,
  feed: (id: string) => ['feeds', id] as const,

  // Article queries
  articles: (filters?: Record<string, any>) => ['articles', filters] as const,
  article: (id: string) => ['articles', id] as const,
  articleSummary: (id: string) => ['articles', id, 'summary'] as const,
  articleAudio: (id: string) => ['articles', id, 'audio'] as const,
  relatedArticles: (id: string) => ['articles', id, 'related'] as const,

  // Digest queries
  digests: (filters?: Record<string, any>) => ['digests', filters] as const,
  digest: (id: string) => ['digests', id] as const,
  latestDigest: ['digests', 'latest'] as const,

  // Search queries
  search: (query: string, filters?: Record<string, any>) => ['search', query, filters] as const,
  trendingTopics: ['topics', 'trending'] as const,

  // Preferences queries
  preferences: ['preferences'] as const,

  // Notification queries
  notifications: ['notifications'] as const,
} as const;
