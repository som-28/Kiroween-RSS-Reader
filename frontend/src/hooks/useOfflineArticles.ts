import { useState, useEffect } from 'react';
import { cacheManager } from '../services/cacheManager';
import { CachedArticle } from '../services/db';

export function useOfflineArticles() {
  const [offlineArticles, setOfflineArticles] = useState<CachedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOfflineArticles = async () => {
    try {
      const articles = await cacheManager.getOfflineArticles();
      setOfflineArticles(articles);
    } catch (error) {
      console.error('Failed to load offline articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineArticles();
  }, []);

  const markForOffline = async (articleId: string) => {
    try {
      await cacheManager.markForOffline(articleId);
      await loadOfflineArticles();
    } catch (error) {
      console.error('Failed to mark article for offline:', error);
      throw error;
    }
  };

  const unmarkForOffline = async (articleId: string) => {
    try {
      await cacheManager.unmarkForOffline(articleId);
      await loadOfflineArticles();
    } catch (error) {
      console.error('Failed to unmark article for offline:', error);
      throw error;
    }
  };

  const isMarkedForOffline = (articleId: string): boolean => {
    return offlineArticles.some((article) => article.id === articleId);
  };

  return {
    offlineArticles,
    isLoading,
    markForOffline,
    unmarkForOffline,
    isMarkedForOffline,
    refresh: loadOfflineArticles,
  };
}
