import type { Article, RelatedArticle } from '../types/models';
import { apiClient } from '../lib/apiClient';

export interface ArticleFeedbackInput {
  feedback: 'like' | 'dislike' | null;
}

export interface UpdateArticleInput {
  isRead?: boolean;
  isFavorite?: boolean;
}

class ArticleService {
  /**
   * Get all articles with optional filters
   */
  async getArticles(params?: {
    feedId?: string;
    isRead?: boolean;
    isFavorite?: boolean;
    limit?: number;
    offset?: number;
    topics?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<Article[]> {
    const queryParams = new URLSearchParams();
    if (params?.feedId) queryParams.append('feedId', params.feedId);
    if (params?.isRead !== undefined) queryParams.append('isRead', String(params.isRead));
    if (params?.isFavorite !== undefined)
      queryParams.append('isFavorite', String(params.isFavorite));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.topics && params.topics.length > 0) {
      params.topics.forEach((topic) => queryParams.append('topics', topic));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());

    const data = await apiClient.get<{ articles: Article[]; count: number }>(
      `/articles?${queryParams}`
    );
    return data.articles || [];
  }

  /**
   * Get a single article by ID
   */
  async getArticle(id: string): Promise<Article> {
    return apiClient.get<Article>(`/articles/${id}`);
  }

  /**
   * Get article summary
   */
  async getArticleSummary(
    id: string
  ): Promise<{ summary: string; topics: string[]; entities: string[] }> {
    return apiClient.get<{ summary: string; topics: string[]; entities: string[] }>(
      `/articles/${id}/summary`
    );
  }

  /**
   * Get related articles
   */
  async getRelatedArticles(id: string): Promise<RelatedArticle[]> {
    return apiClient.get<RelatedArticle[]>(`/articles/${id}/related`);
  }

  /**
   * Generate audio for article
   */
  async generateAudio(id: string): Promise<{ audioUrl: string; duration: number }> {
    return apiClient.get<{ audioUrl: string; duration: number }>(`/articles/${id}/audio`);
  }

  /**
   * Update article (mark as read, favorite, etc.)
   */
  async updateArticle(id: string, updates: UpdateArticleInput): Promise<Article> {
    return apiClient.patch<Article>(`/articles/${id}`, updates);
  }

  /**
   * Submit feedback for article
   */
  async submitFeedback(id: string, feedback: ArticleFeedbackInput): Promise<void> {
    await apiClient.post(`/articles/${id}/feedback`, feedback);
  }
}

export const articleService = new ArticleService();
