import { useMemo } from 'react';
import type { Article } from '../types/models';

type SortType = 'relevance' | 'date' | 'title';

/**
 * Memoized article sorting hook to avoid expensive re-computations
 */
export function useMemoizedSort(articles: Article[], sortBy: SortType): Article[] {
  return useMemo(() => {
    const sorted = [...articles];

    switch (sortBy) {
      case 'relevance':
        return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
      case 'date':
        return sorted.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [articles, sortBy]);
}
