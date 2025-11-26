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

export interface RelatedArticle {
  article: Article;
  connectionType: 'topic' | 'entity' | 'semantic';
  strength: number;
  sharedElements: string[];
}

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
