import { apiClient } from '../lib/apiClient';

export interface Digest {
  id: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  articleIds: string[];
  summary: string;
  topTopics: string[];
  type: 'daily' | 'weekly' | 'custom';
}

export interface DigestWithArticles {
  digest: Digest;
  articles: any[];
}

export interface DigestPreferences {
  digestFrequency: 'daily' | 'weekly' | 'off';
  digestTime: string;
  digestArticleCount: number;
}

export interface GenerateDigestInput {
  type: 'daily' | 'weekly' | 'custom';
  periodStart?: string;
  periodEnd?: string;
  articleCount?: number;
}

class DigestService {
  /**
   * Get the latest digest
   */
  async getLatestDigest(): Promise<DigestWithArticles> {
    const data = await apiClient.get<any>('/digests/latest');
    return {
      digest: {
        ...data.digest,
        generatedAt: new Date(data.digest.generatedAt),
        periodStart: new Date(data.digest.periodStart),
        periodEnd: new Date(data.digest.periodEnd),
      },
      articles: data.articles.map((article: any) => ({
        ...article,
        publishedAt: new Date(article.publishedAt),
        fetchedAt: new Date(article.fetchedAt),
      })),
    };
  }

  /**
   * Get all digests
   */
  async getAllDigests(type?: 'daily' | 'weekly' | 'custom', limit?: number): Promise<Digest[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());

    const data = await apiClient.get<{ digests: any[] }>(`/digests?${params}`);
    return data.digests.map((digest: any) => ({
      ...digest,
      generatedAt: new Date(digest.generatedAt),
      periodStart: new Date(digest.periodStart),
      periodEnd: new Date(digest.periodEnd),
    }));
  }

  /**
   * Get a specific digest by ID
   */
  async getDigestById(id: string): Promise<DigestWithArticles> {
    const data = await apiClient.get<any>(`/digests/${id}`);
    return {
      digest: {
        ...data.digest,
        generatedAt: new Date(data.digest.generatedAt),
        periodStart: new Date(data.digest.periodStart),
        periodEnd: new Date(data.digest.periodEnd),
      },
      articles: data.articles.map((article: any) => ({
        ...article,
        publishedAt: new Date(article.publishedAt),
        fetchedAt: new Date(article.fetchedAt),
      })),
    };
  }

  /**
   * Generate a new digest
   */
  async generateDigest(input: GenerateDigestInput): Promise<DigestWithArticles> {
    const data = await apiClient.post<any>('/digests/generate', input);
    return {
      digest: {
        ...data.digest,
        generatedAt: new Date(data.digest.generatedAt),
        periodStart: new Date(data.digest.periodStart),
        periodEnd: new Date(data.digest.periodEnd),
      },
      articles: data.articles.map((article: any) => ({
        ...article,
        publishedAt: new Date(article.publishedAt),
        fetchedAt: new Date(article.fetchedAt),
      })),
    };
  }

  /**
   * Update digest preferences
   */
  async updateDigestPreferences(
    preferences: Partial<DigestPreferences>
  ): Promise<DigestPreferences> {
    const data = await apiClient.put<{ preferences: DigestPreferences }>(
      '/digests/preferences',
      preferences
    );
    return data.preferences;
  }

  /**
   * Delete a digest
   */
  async deleteDigest(id: string): Promise<void> {
    await apiClient.delete(`/digests/${id}`);
  }
}

export const digestService = new DigestService();
