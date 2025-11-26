import { describe, it, expect } from 'vitest';
import { identifyTopTopics } from './digestService.js';
import type { Article } from '../types/models.js';

describe('Digest Service', () => {
  const createMockArticle = (overrides: Partial<Article> = {}): Article => ({
    id: '1',
    feedId: 'feed1',
    title: 'Test Article',
    link: 'https://example.com/article',
    content: 'Test content',
    excerpt: 'Test excerpt',
    author: 'Test Author',
    publishedAt: new Date(),
    fetchedAt: new Date(),
    summary: 'Test summary',
    topics: [],
    entities: [],
    sentiment: 'neutral',
    relevanceScore: 0.5,
    embedding: null,
    isRead: false,
    isFavorite: false,
    userFeedback: null,
    audioUrl: null,
    audioDuration: null,
    ...overrides,
  });

  describe('identifyTopTopics', () => {
    it('should return empty array for articles with no topics', () => {
      const articles = [createMockArticle({ topics: [] }), createMockArticle({ topics: [] })];

      const topTopics = identifyTopTopics(articles, 5);
      expect(topTopics).toEqual([]);
    });

    it('should identify most frequent topics', () => {
      const articles = [
        createMockArticle({ topics: ['technology', 'ai'] }),
        createMockArticle({ topics: ['technology', 'programming'] }),
        createMockArticle({ topics: ['ai', 'machine learning'] }),
      ];

      const topTopics = identifyTopTopics(articles, 3);
      expect(topTopics).toContain('technology');
      expect(topTopics).toContain('ai');
    });

    it('should limit results to topN', () => {
      const articles = [
        createMockArticle({ topics: ['a', 'b', 'c'] }),
        createMockArticle({ topics: ['d', 'e', 'f'] }),
      ];

      const topTopics = identifyTopTopics(articles, 3);
      expect(topTopics.length).toBeLessThanOrEqual(3);
    });

    it('should normalize topic casing', () => {
      const articles = [
        createMockArticle({ topics: ['Technology', 'AI'] }),
        createMockArticle({ topics: ['technology', 'ai'] }),
      ];

      const topTopics = identifyTopTopics(articles, 5);
      // Should count Technology and technology as the same topic
      expect(topTopics.length).toBeLessThanOrEqual(2);
    });

    it('should sort topics by frequency', () => {
      const articles = [
        createMockArticle({ topics: ['rare'] }),
        createMockArticle({ topics: ['common', 'common'] }),
        createMockArticle({ topics: ['common'] }),
      ];

      const topTopics = identifyTopTopics(articles, 5);
      expect(topTopics[0]).toBe('common');
    });
  });
});
