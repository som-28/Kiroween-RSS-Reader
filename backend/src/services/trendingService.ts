import { ArticleModel } from '../models/Article.js';
import type { Article } from '../types/models.js';

/**
 * Interface for trending topic data
 */
export interface TrendingTopic {
  topic: string;
  articleCount: number;
  trendingScore: number;
  recentArticles: Array<{
    id: string;
    title: string;
    publishedAt: Date;
  }>;
}

/**
 * Calculate trending score based on frequency and recency
 * @param articleCount - Number of articles with this topic
 * @param avgRecency - Average recency score (0-1, where 1 is most recent)
 * @returns Trending score
 */
function calculateTrendingScore(articleCount: number, avgRecency: number): number {
  // Weight frequency and recency equally
  const frequencyScore = Math.log(articleCount + 1); // Log scale for frequency
  const recencyScore = avgRecency * 10; // Scale recency to similar range

  return frequencyScore + recencyScore;
}

/**
 * Calculate recency score for an article (0-1, where 1 is most recent)
 * @param publishedAt - Article publish date
 * @param maxAge - Maximum age in days to consider
 * @returns Recency score between 0 and 1
 */
function calculateRecencyScore(publishedAt: Date, maxAge: number = 30): number {
  const now = new Date();
  const ageInMs = now.getTime() - publishedAt.getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  if (ageInDays > maxAge) {
    return 0;
  }

  // Linear decay from 1 to 0 over maxAge days
  return 1 - ageInDays / maxAge;
}

/**
 * Analyze topic frequency across recent articles
 * @param articles - Array of articles to analyze
 * @returns Map of topics to their data
 */
function analyzeTopicFrequency(articles: Article[]): Map<
  string,
  {
    count: number;
    recencyScores: number[];
    articles: Article[];
  }
> {
  const topicData = new Map<
    string,
    {
      count: number;
      recencyScores: number[];
      articles: Article[];
    }
  >();

  for (const article of articles) {
    const recencyScore = calculateRecencyScore(article.publishedAt);

    for (const topic of article.topics) {
      const normalizedTopic = topic.toLowerCase().trim();

      if (!normalizedTopic) {
        continue;
      }

      if (!topicData.has(normalizedTopic)) {
        topicData.set(normalizedTopic, {
          count: 0,
          recencyScores: [],
          articles: [],
        });
      }

      const data = topicData.get(normalizedTopic)!;
      data.count++;
      data.recencyScores.push(recencyScore);
      data.articles.push(article);
    }
  }

  return topicData;
}

/**
 * Get trending topics from recent articles
 * @param daysBack - Number of days to look back (default: 7)
 * @param limit - Maximum number of trending topics to return (default: 10)
 * @returns Array of trending topics sorted by trending score
 */
export function getTrendingTopics(daysBack: number = 7, limit: number = 10): TrendingTopic[] {
  // Get recent articles
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const recentArticles = ArticleModel.findByDateRange(startDate, endDate);

  if (recentArticles.length === 0) {
    return [];
  }

  // Analyze topic frequency
  const topicData = analyzeTopicFrequency(recentArticles);

  // Calculate trending scores
  const trendingTopics: TrendingTopic[] = [];

  for (const [topic, data] of topicData.entries()) {
    // Calculate average recency score
    const avgRecency =
      data.recencyScores.reduce((sum, score) => sum + score, 0) / data.recencyScores.length;

    // Calculate trending score
    const trendingScore = calculateTrendingScore(data.count, avgRecency);

    // Get most recent articles for this topic (up to 5)
    const sortedArticles = data.articles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 5);

    trendingTopics.push({
      topic,
      articleCount: data.count,
      trendingScore,
      recentArticles: sortedArticles.map((article) => ({
        id: article.id,
        title: article.title,
        publishedAt: article.publishedAt,
      })),
    });
  }

  // Sort by trending score and return top N
  return trendingTopics.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
}

/**
 * Get trending entities (similar to topics but for named entities)
 * @param daysBack - Number of days to look back (default: 7)
 * @param limit - Maximum number of trending entities to return (default: 10)
 * @returns Array of trending entities
 */
export function getTrendingEntities(daysBack: number = 7, limit: number = 10): TrendingTopic[] {
  // Get recent articles
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const recentArticles = ArticleModel.findByDateRange(startDate, endDate);

  if (recentArticles.length === 0) {
    return [];
  }

  // Analyze entity frequency (similar to topics)
  const entityData = new Map<
    string,
    {
      count: number;
      recencyScores: number[];
      articles: Article[];
    }
  >();

  for (const article of recentArticles) {
    const recencyScore = calculateRecencyScore(article.publishedAt);

    for (const entity of article.entities) {
      const normalizedEntity = entity.toLowerCase().trim();

      if (!normalizedEntity) {
        continue;
      }

      if (!entityData.has(normalizedEntity)) {
        entityData.set(normalizedEntity, {
          count: 0,
          recencyScores: [],
          articles: [],
        });
      }

      const data = entityData.get(normalizedEntity)!;
      data.count++;
      data.recencyScores.push(recencyScore);
      data.articles.push(article);
    }
  }

  // Calculate trending scores
  const trendingEntities: TrendingTopic[] = [];

  for (const [entity, data] of entityData.entries()) {
    const avgRecency =
      data.recencyScores.reduce((sum, score) => sum + score, 0) / data.recencyScores.length;
    const trendingScore = calculateTrendingScore(data.count, avgRecency);

    const sortedArticles = data.articles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 5);

    trendingEntities.push({
      topic: entity, // Using 'topic' field for consistency
      articleCount: data.count,
      trendingScore,
      recentArticles: sortedArticles.map((article) => ({
        id: article.id,
        title: article.title,
        publishedAt: article.publishedAt,
      })),
    });
  }

  return trendingEntities.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
}

/**
 * Get combined trending topics and entities
 * @param daysBack - Number of days to look back (default: 7)
 * @param limit - Maximum number of items to return (default: 10)
 * @returns Array of trending items (topics and entities combined)
 */
export function getTrendingAll(
  daysBack: number = 7,
  limit: number = 10
): Array<TrendingTopic & { type: 'topic' | 'entity' }> {
  const topics = getTrendingTopics(daysBack, limit * 2);
  const entities = getTrendingEntities(daysBack, limit * 2);

  const combined = [
    ...topics.map((t) => ({ ...t, type: 'topic' as const })),
    ...entities.map((e) => ({ ...e, type: 'entity' as const })),
  ];

  return combined.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
}
