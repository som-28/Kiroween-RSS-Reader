import type { Article } from '../types/models';
import { apiClient } from '../lib/apiClient';

export interface SearchFilters {
  feedIds?: string[];
  topics?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'topic' | 'title' | 'recent';
}

class SearchService {
  private recentSearches: string[] = [];
  private readonly MAX_RECENT = 10;

  constructor() {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('haunted-recent-searches');
    if (saved) {
      try {
        this.recentSearches = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }

  /**
   * Search articles with filters
   */
  async search(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResult> {
    const params = new URLSearchParams();

    if (query) {
      params.append('q', query);
      this.addRecentSearch(query);
    }

    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    if (filters?.feedIds && filters.feedIds.length > 0) {
      params.append('feedIds', filters.feedIds.join(','));
    }

    if (filters?.topics && filters.topics.length > 0) {
      params.append('topics', filters.topics.join(','));
    }

    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }

    return apiClient.get<SearchResult>(`/search?${params}`);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const data = await apiClient.get<{ suggestions: string[] }>(
        `/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      return data.suggestions.map((text: string) => ({
        text,
        type: 'topic' as const,
      }));
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): string[] {
    return [...this.recentSearches];
  }

  /**
   * Add a search to recent searches
   */
  private addRecentSearch(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter((s) => s !== trimmed);

    // Add to beginning
    this.recentSearches.unshift(trimmed);

    // Keep only MAX_RECENT items
    if (this.recentSearches.length > this.MAX_RECENT) {
      this.recentSearches = this.recentSearches.slice(0, this.MAX_RECENT);
    }

    // Save to localStorage
    try {
      localStorage.setItem('haunted-recent-searches', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('haunted-recent-searches');
  }

  /**
   * Remove a specific recent search
   */
  removeRecentSearch(query: string): void {
    this.recentSearches = this.recentSearches.filter((s) => s !== query);
    try {
      localStorage.setItem('haunted-recent-searches', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  }

  /**
   * Search articles (alias for search method)
   */
  async searchArticles(query: string, filters?: SearchFilters): Promise<Article[]> {
    const result = await this.search(query, filters);
    return result.articles;
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(): Promise<Array<{ topic: string; count: number }>> {
    return apiClient.get<Array<{ topic: string; count: number }>>('/topics/trending');
  }
}

export const searchService = new SearchService();
