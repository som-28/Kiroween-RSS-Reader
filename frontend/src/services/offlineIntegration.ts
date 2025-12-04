/**
 * Offline Integration Guide
 *
 * This file demonstrates how to integrate offline support into the Haunted RSS Reader.
 * It provides wrapper functions for API calls that automatically handle caching and offline queuing.
 */

import axios from 'axios';
import { cacheStorage, CachedFeed, CachedArticle, CachedDigest } from './db';
import { syncService } from './syncService';
import { cacheManager } from './cacheManager';
import { getBaseUrl } from '../config/api';

const API_BASE_URL = getBaseUrl();

// Helper to check if we're online
const isOnline = (): boolean => syncService.getOnlineStatus();

/**
 * Fetch feeds with offline support
 */
export async function fetchFeeds(): Promise<CachedFeed[]> {
  try {
    if (isOnline()) {
      const response = await axios.get(`${API_BASE_URL}/feeds`);
      const feeds = response.data;

      // Cache the feeds
      await cacheStorage.cacheFeeds(feeds);

      return feeds;
    }
  } catch (error) {
    console.error('Failed to fetch feeds from server:', error);
  }

  // Return cached feeds if offline or error
  return await cacheStorage.getCachedFeeds();
}

/**
 * Add a new feed with offline support
 */
export async function addFeed(url: string, title: string): Promise<CachedFeed> {
  if (isOnline()) {
    try {
      const response = await axios.post(`${API_BASE_URL}/feeds`, { url, title });
      const feed = response.data;

      // Cache the new feed
      await cacheStorage.cacheFeed(feed);

      return feed;
    } catch (error) {
      console.error('Failed to add feed:', error);
      throw error;
    }
  } else {
    // Queue the operation for later
    const tempId = `temp-${Date.now()}`;
    const tempFeed: CachedFeed = {
      id: tempId,
      url,
      title,
      description: null,
      lastFetched: null,
      fetchInterval: 60,
      status: 'active',
      errorMessage: null,
      articleCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      cachedAt: new Date(),
    };

    await cacheStorage.cacheFeed(tempFeed);
    await syncService.queueOperation('CREATE', 'feed', tempId, { url, title });

    return tempFeed;
  }
}

/**
 * Delete a feed with offline support
 */
export async function deleteFeed(feedId: string): Promise<void> {
  if (isOnline()) {
    try {
      await axios.delete(`${API_BASE_URL}/feeds/${feedId}`);
      await cacheStorage.removeCachedFeed(feedId);
    } catch (error) {
      console.error('Failed to delete feed:', error);
      throw error;
    }
  } else {
    // Queue the operation and remove from cache
    await syncService.queueOperation('DELETE', 'feed', feedId, {});
    await cacheStorage.removeCachedFeed(feedId);
  }
}

/**
 * Fetch articles with offline support
 */
export async function fetchArticles(feedId?: string): Promise<CachedArticle[]> {
  try {
    if (isOnline()) {
      const url = feedId ? `${API_BASE_URL}/articles?feedId=${feedId}` : `${API_BASE_URL}/articles`;

      const response = await axios.get(url);
      const articles = response.data;

      // Cache the articles
      await cacheStorage.cacheArticles(
        articles.map((a: any) => ({
          ...a,
          markedForOffline: false,
        }))
      );

      // Perform auto cleanup if needed
      await cacheManager.autoCleanup();

      return articles;
    }
  } catch (error) {
    console.error('Failed to fetch articles from server:', error);
  }

  // Return cached articles if offline or error
  return await cacheStorage.getCachedArticles(feedId);
}

/**
 * Fetch a single article with offline support
 */
export async function fetchArticle(articleId: string): Promise<CachedArticle | null> {
  try {
    if (isOnline()) {
      const response = await axios.get(`${API_BASE_URL}/articles/${articleId}`);
      const article = response.data;

      // Cache the article
      await cacheStorage.cacheArticle({
        ...article,
        markedForOffline: false,
      });

      return article;
    }
  } catch (error) {
    console.error('Failed to fetch article from server:', error);
  }

  // Return cached article if offline or error
  return (await cacheStorage.getCachedArticle(articleId)) || null;
}

/**
 * Update article (mark as read, favorite, etc.) with offline support
 */
export async function updateArticle(
  articleId: string,
  updates: Partial<CachedArticle>
): Promise<void> {
  // Update cache immediately for optimistic UI
  const cachedArticle = await cacheStorage.getCachedArticle(articleId);
  if (cachedArticle) {
    await cacheStorage.cacheArticle({
      ...cachedArticle,
      ...updates,
    });
  }

  if (isOnline()) {
    try {
      await axios.put(`${API_BASE_URL}/articles/${articleId}`, updates);
    } catch (error) {
      console.error('Failed to update article:', error);
      // Queue for later sync
      await syncService.queueOperation('UPDATE', 'article', articleId, updates);
    }
  } else {
    // Queue the operation
    await syncService.queueOperation('UPDATE', 'article', articleId, updates);
  }
}

/**
 * Fetch latest digest with offline support
 */
export async function fetchLatestDigest(): Promise<CachedDigest | null> {
  try {
    if (isOnline()) {
      const response = await axios.get(`${API_BASE_URL}/digests/latest`);
      const digest = response.data;

      if (digest) {
        // Cache the digest
        await cacheStorage.cacheDigest(digest);

        // Also cache the articles in the digest
        const articles = await axios.get(`${API_BASE_URL}/articles`, {
          params: { ids: digest.articleIds.join(',') },
        });

        if (articles.data) {
          await cacheStorage.cacheArticles(
            articles.data.map((a: any) => ({
              ...a,
              markedForOffline: false,
            }))
          );
        }
      }

      return digest;
    }
  } catch (error) {
    console.error('Failed to fetch digest from server:', error);
  }

  // Return cached digest if offline or error
  return (await cacheStorage.getLatestCachedDigest()) || null;
}

/**
 * Generate a new digest with offline support
 */
export async function generateDigest(): Promise<CachedDigest> {
  if (isOnline()) {
    try {
      const response = await axios.post(`${API_BASE_URL}/digests/generate`);
      const digest = response.data;

      // Cache the new digest
      await cacheStorage.cacheDigest(digest);

      return digest;
    } catch (error) {
      console.error('Failed to generate digest:', error);
      throw error;
    }
  } else {
    throw new Error('Cannot generate digest while offline');
  }
}

/**
 * Initialize offline support
 * Call this when the app starts
 */
export async function initializeOfflineSupport(): Promise<void> {
  console.log('Initializing offline support...');

  // Start periodic cleanup
  cacheManager.startPeriodicCleanup();

  // Sync pending operations if online
  if (isOnline()) {
    await syncService.syncPendingOperations();
  }

  console.log('Offline support initialized');
}

/**
 * Cleanup offline support
 * Call this when the app unmounts
 */
export function cleanupOfflineSupport(): void {
  cacheManager.stopPeriodicCleanup();
  syncService.cleanup();
}
