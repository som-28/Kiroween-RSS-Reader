// Feed types
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
  title: string;
  description?: string;
  fetchInterval?: number;
}

export interface UpdateFeedInput {
  title?: string;
  description?: string;
  fetchInterval?: number;
  status?: 'active' | 'error' | 'paused';
  errorMessage?: string;
  lastFetched?: Date;
  articleCount?: number;
}

// Article types
export interface Article {
  id: string;
  feedId: string;
  title: string;
  link: string;
  content: string;
  excerpt: string | null;
  author: string | null;
  publishedAt: Date;
  fetchedAt: Date;
  summary: string | null;
  topics: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  relevanceScore: number;
  embedding: number[] | null;
  isRead: boolean;
  isFavorite: boolean;
  userFeedback: 'like' | 'dislike' | null;
  audioUrl: string | null;
  audioDuration: number | null;
}

export interface CreateArticleInput {
  feedId: string;
  title: string;
  link: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedAt: Date;
}

export interface UpdateArticleInput {
  summary?: string;
  topics?: string[];
  entities?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevanceScore?: number;
  embedding?: number[];
  isRead?: boolean;
  isFavorite?: boolean;
  userFeedback?: 'like' | 'dislike' | null;
  audioUrl?: string;
  audioDuration?: number;
}

// User preferences types
export interface UserPreferences {
  id: string;
  interests: string[];
  excludedTopics: string[];
  preferredSources: string[];
  digestFrequency: 'daily' | 'weekly' | 'off';
  digestTime: string;
  digestArticleCount: number;
  enableNotifications: boolean;
  notificationThreshold: number;
  theme: 'graveyard' | 'haunted-mansion' | 'witch-cottage';
  enableAnimations: boolean;
  enableSoundEffects: boolean;
  summaryLength: 'short' | 'medium' | 'long';
  audioVoice: string;
  audioSpeed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferencesInput {
  interests?: string[];
  excludedTopics?: string[];
  preferredSources?: string[];
  digestFrequency?: 'daily' | 'weekly' | 'off';
  digestTime?: string;
  digestArticleCount?: number;
  enableNotifications?: boolean;
  notificationThreshold?: number;
  theme?: 'graveyard' | 'haunted-mansion' | 'witch-cottage';
  enableAnimations?: boolean;
  enableSoundEffects?: boolean;
  summaryLength?: 'short' | 'medium' | 'long';
  audioVoice?: string;
  audioSpeed?: number;
}

// Digest types
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

export interface CreateDigestInput {
  periodStart: Date;
  periodEnd: Date;
  articleIds: string[];
  summary: string;
  topTopics: string[];
  type: 'daily' | 'weekly' | 'custom';
}

// Article connection types
export interface ArticleConnection {
  id: string;
  article1Id: string;
  article2Id: string;
  connectionType: 'topic' | 'entity' | 'semantic';
  strength: number;
  sharedElements: string[];
  createdAt: Date;
}

export interface CreateArticleConnectionInput {
  article1Id: string;
  article2Id: string;
  connectionType: 'topic' | 'entity' | 'semantic';
  strength: number;
  sharedElements: string[];
}
