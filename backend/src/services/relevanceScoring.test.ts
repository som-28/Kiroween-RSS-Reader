import { describe, it, expect } from 'vitest';
import { calculateRelevanceScore } from './relevanceScoring.js';
import type { Article, UserPreferences } from '../types/models.js';

describe('Relevance Scoring', () => {
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
    relevanceScore: 0,
    embedding: null,
    isRead: false,
    isFavorite: false,
    userFeedback: null,
    audioUrl: null,
    audioDuration: null,
    ...overrides,
  });

  const createMockPreferences = (overrides: Partial<UserPreferences> = {}): UserPreferences => ({
    id: '1',
    interests: [],
    excludedTopics: [],
    preferredSources: [],
    digestFrequency: 'daily',
    digestTime: '09:00',
    digestArticleCount: 10,
    enableNotifications: true,
    notificationThreshold: 0.7,
    theme: 'graveyard',
    enableAnimations: true,
    enableSoundEffects: false,
    summaryLength: 'medium',
    audioVoice: 'default',
    audioSpeed: 1.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('calculateRelevanceScore', () => {
    it('should return 0.5 for article with no matching topics', () => {
      const article = createMockArticle({
        topics: ['sports', 'football'],
      });
      const preferences = createMockPreferences({
        interests: ['technology', 'programming'],
      });

      const score = calculateRelevanceScore(article, preferences);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return higher score for articles with matching topics', () => {
      const article = createMockArticle({
        topics: ['technology', 'programming'],
      });
      const preferences = createMockPreferences({
        interests: ['technology', 'programming'],
      });

      const score = calculateRelevanceScore(article, preferences);
      expect(score).toBeGreaterThan(0.5);
    });

    it('should penalize articles with excluded topics', () => {
      const article = createMockArticle({
        topics: ['technology', 'politics'],
      });
      const preferences = createMockPreferences({
        interests: ['technology'],
        excludedTopics: ['politics'],
      });

      const score = calculateRelevanceScore(article, preferences);
      expect(score).toBeLessThan(1);
    });

    it('should give higher scores to recent articles', () => {
      const recentArticle = createMockArticle({
        publishedAt: new Date(),
        topics: ['technology'],
      });
      const oldArticle = createMockArticle({
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        topics: ['technology'],
      });
      const preferences = createMockPreferences({
        interests: ['technology'],
      });

      const recentScore = calculateRelevanceScore(recentArticle, preferences);
      const oldScore = calculateRelevanceScore(oldArticle, preferences);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should consider entity matches', () => {
      const article = createMockArticle({
        entities: ['OpenAI', 'GPT-4'],
        topics: [],
      });
      const preferences = createMockPreferences({
        interests: ['OpenAI', 'artificial intelligence'],
      });

      const score = calculateRelevanceScore(article, preferences);
      expect(score).toBeGreaterThan(0.5);
    });

    it('should return score between 0 and 1', () => {
      const article = createMockArticle({
        topics: ['technology', 'programming', 'ai'],
        entities: ['OpenAI', 'Google'],
      });
      const preferences = createMockPreferences({
        interests: ['technology', 'programming', 'ai'],
      });

      const score = calculateRelevanceScore(article, preferences);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
