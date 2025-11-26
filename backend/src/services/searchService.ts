import { db } from '../config/database.js';
import type { Article } from '../types/models.js';

// Helper to convert database row to Article object
function rowToArticle(row: any): Article {
  return {
    id: row.id,
    feedId: row.feed_id,
    title: row.title,
    link: row.link,
    content: row.content,
    excerpt: row.excerpt,
    author: row.author,
    publishedAt: new Date(row.published_at),
    fetchedAt: new Date(row.fetched_at),
    summary: row.summary,
    topics: row.topics ? JSON.parse(row.topics) : [],
    entities: row.entities ? JSON.parse(row.entities) : [],
    sentiment: row.sentiment,
    relevanceScore: row.relevance_score,
    embedding: row.embedding ? JSON.parse(row.embedding) : null,
    isRead: Boolean(row.is_read),
    isFavorite: Boolean(row.is_favorite),
    userFeedback: row.user_feedback,
    audioUrl: row.audio_url,
    audioDuration: row.audio_duration,
  };
}

export interface SearchFilters {
  feedIds?: string[];
  topics?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface SearchResult {
  article: Article;
  highlights: {
    title?: string;
    content?: string;
    summary?: string;
  };
  relevanceRank: number;
}

export interface PaginatedSearchResults {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Highlight matching keywords in text
 */
function highlightMatches(text: string, query: string): string {
  if (!text || !query) return text;

  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length > 2);
  let highlighted = text;

  keywords.forEach((keyword) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return highlighted;
}

/**
 * Calculate relevance score based on keyword matches
 */
function calculateRelevance(article: Article, query: string): number {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length > 0);
  let score = 0;

  keywords.forEach((keyword) => {
    // Title matches are worth more
    if (article.title.toLowerCase().includes(keyword)) {
      score += 3;
    }

    // Summary matches
    if (article.summary?.toLowerCase().includes(keyword)) {
      score += 2;
    }

    // Content matches
    if (article.content.toLowerCase().includes(keyword)) {
      score += 1;
    }

    // Topic matches
    if (article.topics.some((topic) => topic.toLowerCase().includes(keyword))) {
      score += 2;
    }
  });

  // Boost by existing relevance score
  score += article.relevanceScore * 5;

  return score;
}

/**
 * Full-text search with filters and pagination
 */
export function searchArticles(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 20
): PaginatedSearchResults {
  const offset = (page - 1) * pageSize;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: any[] = [];

  // Search query
  if (query && query.trim()) {
    const searchPattern = `%${query.trim()}%`;
    conditions.push('(title LIKE ? OR content LIKE ? OR summary LIKE ?)');
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Feed filter
  if (filters.feedIds && filters.feedIds.length > 0) {
    const placeholders = filters.feedIds.map(() => '?').join(',');
    conditions.push(`feed_id IN (${placeholders})`);
    params.push(...filters.feedIds);
  }

  // Date range filter
  if (filters.startDate) {
    conditions.push('published_at >= ?');
    params.push(filters.startDate.toISOString());
  }

  if (filters.endDate) {
    conditions.push('published_at <= ?');
    params.push(filters.endDate.toISOString());
  }

  // Topic filter
  if (filters.topics && filters.topics.length > 0) {
    // For topics, we need to check if any of the filter topics exist in the article's topics JSON array
    const topicConditions = filters.topics.map(() => 'topics LIKE ?').join(' OR ');
    conditions.push(`(${topicConditions})`);
    filters.topics.forEach((topic) => {
      params.push(`%"${topic}"%`);
    });
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM articles ${whereClause}`;
  const countStmt = db.prepare(countQuery);
  const countResult = countStmt.get(...params) as { count: number };
  const total = countResult.count;

  // Get paginated results
  const searchQuery = `
    SELECT * FROM articles 
    ${whereClause}
    ORDER BY relevance_score DESC, published_at DESC
    LIMIT ? OFFSET ?
  `;

  const stmt = db.prepare(searchQuery);
  const rows = stmt.all(...params, pageSize, offset);
  const articles = rows.map(rowToArticle);

  // Calculate relevance and add highlights
  const results: SearchResult[] = articles.map((article) => {
    const relevanceRank = calculateRelevance(article, query);

    return {
      article,
      highlights: {
        title: highlightMatches(article.title, query),
        content: highlightMatches(article.excerpt || article.content.substring(0, 300), query),
        summary: article.summary ? highlightMatches(article.summary, query) : undefined,
      },
      relevanceRank,
    };
  });

  // Sort by relevance rank
  results.sort((a, b) => b.relevanceRank - a.relevanceRank);

  const totalPages = Math.ceil(total / pageSize);

  return {
    results,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get recent searches (placeholder for future implementation with user tracking)
 */
export function getRecentSearches(): string[] {
  // This would typically be stored per user in a database
  // For now, return empty array
  return [];
}

/**
 * Get search suggestions based on existing topics and entities
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  if (!query || query.length < 2) return [];

  const searchPattern = `%${query}%`;

  // Get topics that match the query
  const topicsQuery = `
    SELECT DISTINCT topics FROM articles 
    WHERE topics IS NOT NULL AND topics LIKE ?
    LIMIT 100
  `;

  const stmt = db.prepare(topicsQuery);
  const rows = stmt.all(searchPattern);

  const suggestions = new Set<string>();

  rows.forEach((row: any) => {
    if (row.topics) {
      try {
        const topics = JSON.parse(row.topics) as string[];
        topics.forEach((topic) => {
          if (topic.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(topic);
          }
        });
      } catch (e) {
        // Skip invalid JSON
      }
    }
  });

  return Array.from(suggestions).slice(0, limit);
}
