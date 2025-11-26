import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMemoizedSort } from './useMemoizedSort';
import type { Article } from '../types/models';

describe('useMemoizedSort', () => {
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

  it('should sort by relevance score descending', () => {
    const articles = [
      createMockArticle({ id: '1', relevanceScore: 0.3 }),
      createMockArticle({ id: '2', relevanceScore: 0.9 }),
      createMockArticle({ id: '3', relevanceScore: 0.6 }),
    ];
    const { result } = renderHook(() => useMemoizedSort(articles, 'relevance'));
    expect(result.current[0].id).toBe('2');
    expect(result.current[1].id).toBe('3');
    expect(result.current[2].id).toBe('1');
  });

  it('should sort by date descending', () => {
    const articles = [
      createMockArticle({ id: '1', publishedAt: new Date('2024-01-01') }),
      createMockArticle({ id: '2', publishedAt: new Date('2024-03-01') }),
      createMockArticle({ id: '3', publishedAt: new Date('2024-02-01') }),
    ];
    const { result } = renderHook(() => useMemoizedSort(articles, 'date'));
    expect(result.current[0].id).toBe('2');
    expect(result.current[1].id).toBe('3');
    expect(result.current[2].id).toBe('1');
  });

  it('should sort by title alphabetically', () => {
    const articles = [
      createMockArticle({ id: '1', title: 'Zebra Article' }),
      createMockArticle({ id: '2', title: 'Apple Article' }),
      createMockArticle({ id: '3', title: 'Mango Article' }),
    ];
    const { result } = renderHook(() => useMemoizedSort(articles, 'title'));
    expect(result.current[0].id).toBe('2');
    expect(result.current[1].id).toBe('3');
    expect(result.current[2].id).toBe('1');
  });

  it('should not mutate original array', () => {
    const articles = [
      createMockArticle({ id: '1', relevanceScore: 0.3 }),
      createMockArticle({ id: '2', relevanceScore: 0.9 }),
    ];
    const originalOrder = articles.map((a) => a.id);
    renderHook(() => useMemoizedSort(articles, 'relevance'));
    expect(articles.map((a) => a.id)).toEqual(originalOrder);
  });
});
