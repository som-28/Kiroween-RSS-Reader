import { useQuery } from '@tanstack/react-query';
import { searchService, type SearchFilters } from '../../services/searchService';
import { queryKeys } from '../../lib/queryClient';

/**
 * Hook to search articles
 */
export function useSearch(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: () => searchService.searchArticles(query, filters),
    enabled: query.length > 0, // Only search when there's a query
    // Search results can be cached briefly
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch trending topics
 */
export function useTrendingTopics() {
  return useQuery({
    queryKey: queryKeys.trendingTopics,
    queryFn: () => searchService.getTrendingTopics(),
    // Trending topics change slowly, cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
}
