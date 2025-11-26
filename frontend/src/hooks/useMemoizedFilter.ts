import { useMemo } from 'react';
import type { Article } from '../types/models';

interface FilterOptions {
  topics?: string[];
  startDate?: Date;
  endDate?: Date;
  isRead?: boolean;
  isFavorite?: boolean;
  feedId?: string;
}

/**
 * Memoized article filtering hook to avoid expensive re-computations
 */
export function useMemoizedFilter(articles: Article[], filters: FilterOptions): Article[] {
  return useMemo(() => {
    let filtered = [...articles];

    // Filter by feed
    if (filters.feedId) {
      filtered = filtered.filter((article) => article.feedId === filters.feedId);
    }

    // Filter by read status
    if (filters.isRead !== undefined) {
      filtered = filtered.filter((article) => article.isRead === filters.isRead);
    }

    // Filter by favorite status
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter((article) => article.isFavorite === filters.isFavorite);
    }

    // Filter by topics
    if (filters.topics && filters.topics.length > 0) {
      filtered = filtered.filter((article) =>
        filters.topics!.some((topic) => article.topics.includes(topic))
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter((article) => new Date(article.publishedAt) >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter((article) => new Date(article.publishedAt) <= filters.endDate!);
    }

    return filtered;
  }, [articles, filters]);
}
