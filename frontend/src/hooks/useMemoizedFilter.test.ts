import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMemoizedFilter } from './useMemoizedFilter';
import type { Article } from '../types/models';

describe('useMemoizedFilter', () => {
  const createMockArticle = (overrides: Partial<Article> = {}): Article => ({
    id: '1',
    feedId: 'feed1',
    title: 'Test Article',
    link: 'https://example.com/article',
    content: 'Test content',
    excerpt: 'Test excerpt',
    author: 'Test Author',
    publishedAt: new Date('2024-01-01'),
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

  it('should return all articles when no filters applied', () => {
    const articles = [createMockArticle({ id: '1' }), createMockArticle({ id: '2' })];
    const { result } = renderHook(() => useMemoizedFilter(articles, {}));
    expect(result.current).toHaveLength(2);
  });

  it('should filter by feedId', () => {
    const articles = [
      createMockArticle({ id: '1', feedId: 'feed1' }),
      createMockArticle({ id: '2', feedId: 'feed2' }),
    ];
    const { result } = renderHook(() => useMemoizedFilter(articles, { feedId: 'feed1' }));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].feedId).toBe('feed1');
  });

  it('should filter by read status', () => {
    const articles = [
      createMockArticle({ id: '1', isRead: true }),
      createMockArticle({ id: '2', isRead: false }),
    ];
    const { result } = renderHook(() => useMemoizedFilter(articles, { isRead: true }));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].isRead).toBe(true);
  });

  it('should filter by favorite status', () => {
    const articles = [
      createMockArticle({ id: '1', isFavorite: true }),
      createMockArticle({ id: '2', isFavorite: false }),
    ];
    const { result } = renderHook(() => useMemoizedFilter(articles, { isFavorite: true }));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].isFavorite).toBe(true);
  });

  it('should filter by topics', () => {
    const articles = [
      createMockArticle({ id: '1', topics: ['technology', 'ai'] }),
      createMockArticle({ id: '2', topics: ['sports'] }),
    ];
    const { result } = renderHook(() => useMemoizedFilter(articles, { topics: ['technology'] }));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].topics).toContain('technology');
  });

  it('should filter by date range', () => {
    const articles = [
      createMockArticle({ id: '1', publishedAt: new Date('2024-01-01') }),
      createMockArticle({ id: '2', publishedAt: new Date('2024-02-01') }),
      createMockArticle({ id: '3', publishedAt: new Date('2024-03-01') }),
    ];
    const { result } = renderHook(() =>
      useMemoizedFilter(articles, {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('2');
  });

  it('should apply multiple filters', () => {
    const articles = [
      createMockArticle({
        id: '1',
        feedId: 'feed1',
        isRead: false,
        topics: ['technology'],
      }),
      createMockArticle({
        id: '2',
        feedId: 'feed1',
        isRead: true,
        topics: ['technology'],
      }),
      createMockArticle({
        id: '3',
        feedId: 'feed2',
        isRead: false,
        topics: ['sports'],
      }),
    ];
    const { result } = renderHook(() =>
      useMemoizedFilter(articles, {
        feedId: 'feed1',
        isRead: false,
        topics: ['technology'],
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('1');
  });
});
