import { apiClient } from '../lib/apiClient';

export interface Feed {
  id: string;
  url: string;
  title: string;
  description: string | null;
  lastFetched: Date | null;
  fetchInterval: number;
  status: 'active' | 'error' | 'paused';
  errorMessage: string | null;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedInput {
  url: string;
  title?: string;
  description?: string;
  fetchInterval?: number;
}

export interface UpdateFeedInput {
  title?: string;
  description?: string;
  fetchInterval?: number;
  status?: 'active' | 'error' | 'paused';
}

class FeedService {
  private baseUrl = '/feeds';

  async getFeeds(): Promise<Feed[]> {
    const data = await apiClient.get<{ feeds: Feed[] }>(this.baseUrl);
    return data.feeds.map((feed) => ({
      ...feed,
      lastFetched: feed.lastFetched ? new Date(feed.lastFetched) : null,
      createdAt: new Date(feed.createdAt),
      updatedAt: new Date(feed.updatedAt),
    }));
  }

  async getFeed(id: string): Promise<Feed> {
    const data = await apiClient.get<{ feed: Feed }>(`${this.baseUrl}/${id}`);
    return {
      ...data.feed,
      lastFetched: data.feed.lastFetched ? new Date(data.feed.lastFetched) : null,
      createdAt: new Date(data.feed.createdAt),
      updatedAt: new Date(data.feed.updatedAt),
    };
  }

  async createFeed(input: CreateFeedInput): Promise<Feed> {
    const data = await apiClient.post<{ feed: Feed }>(this.baseUrl, input);
    return {
      ...data.feed,
      lastFetched: data.feed.lastFetched ? new Date(data.feed.lastFetched) : null,
      createdAt: new Date(data.feed.createdAt),
      updatedAt: new Date(data.feed.updatedAt),
    };
  }

  async updateFeed(id: string, input: UpdateFeedInput): Promise<Feed> {
    const data = await apiClient.put<{ feed: Feed }>(`${this.baseUrl}/${id}`, input);
    return {
      ...data.feed,
      lastFetched: data.feed.lastFetched ? new Date(data.feed.lastFetched) : null,
      createdAt: new Date(data.feed.createdAt),
      updatedAt: new Date(data.feed.updatedAt),
    };
  }

  async deleteFeed(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async refreshFeed(id: string): Promise<{ articlesAdded: number; feed: Feed }> {
    const data = await apiClient.put<{ articlesAdded: number; feed: Feed }>(
      `${this.baseUrl}/${id}/refresh`
    );
    return {
      articlesAdded: data.articlesAdded,
      feed: {
        ...data.feed,
        lastFetched: data.feed.lastFetched ? new Date(data.feed.lastFetched) : null,
        createdAt: new Date(data.feed.createdAt),
        updatedAt: new Date(data.feed.updatedAt),
      },
    };
  }
}

export const feedService = new FeedService();
