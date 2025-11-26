import { ArticleModel } from '../models/Article.js';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import { PreferenceWeightModel } from '../models/PreferenceWeight.js';
import type { Article, UserPreferences } from '../types/models.js';

/**
 * Calculate relevance score for an article based on user preferences
 * Score is between 0 and 1, where 1 is most relevant
 */
export function calculateRelevanceScore(article: Article, preferences: UserPreferences): number {
  let score = 0;
  let totalWeight = 0;

  // Weight configuration
  const TOPIC_MATCH_WEIGHT = 0.4;
  const ENTITY_MATCH_WEIGHT = 0.3;
  const RECENCY_WEIGHT = 0.2;
  const EXCLUDED_TOPIC_PENALTY = 0.1;

  // 1. Topic matching score (40% weight) - with learned weights
  if (preferences.interests.length > 0 && article.topics.length > 0) {
    let weightedTopicScore = 0;
    let matchCount = 0;

    for (const topic of article.topics) {
      const isMatch = preferences.interests.some(
        (interest) =>
          topic.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(topic.toLowerCase())
      );

      if (isMatch) {
        // Apply learned weight for this topic
        const learnedWeight = PreferenceWeightModel.getWeight(topic);
        weightedTopicScore += learnedWeight;
        matchCount++;
      }
    }

    if (matchCount > 0) {
      // Normalize by number of interests and average learned weight
      const topicScore = Math.min(weightedTopicScore / preferences.interests.length, 1);
      score += topicScore * TOPIC_MATCH_WEIGHT;
    }
    totalWeight += TOPIC_MATCH_WEIGHT;
  }

  // 2. Entity matching score (30% weight)
  if (preferences.interests.length > 0 && article.entities.length > 0) {
    const entityMatches = article.entities.filter((entity) =>
      preferences.interests.some(
        (interest) =>
          entity.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(entity.toLowerCase())
      )
    ).length;

    const entityScore = Math.min(entityMatches / preferences.interests.length, 1);
    score += entityScore * ENTITY_MATCH_WEIGHT;
    totalWeight += ENTITY_MATCH_WEIGHT;
  }

  // 3. Recency score (20% weight)
  // Articles published within the last 24 hours get full score
  // Score decreases linearly over 30 days
  const now = Date.now();
  const publishedTime = article.publishedAt.getTime();
  const ageInDays = (now - publishedTime) / (1000 * 60 * 60 * 24);

  let recencyScore = 1;
  if (ageInDays > 1) {
    recencyScore = Math.max(0, 1 - (ageInDays - 1) / 29);
  }

  score += recencyScore * RECENCY_WEIGHT;
  totalWeight += RECENCY_WEIGHT;

  // 4. Excluded topics penalty (10% weight)
  if (preferences.excludedTopics.length > 0 && article.topics.length > 0) {
    const excludedMatches = article.topics.filter((topic) =>
      preferences.excludedTopics.some(
        (excluded) =>
          topic.toLowerCase().includes(excluded.toLowerCase()) ||
          excluded.toLowerCase().includes(topic.toLowerCase())
      )
    ).length;

    if (excludedMatches > 0) {
      // Reduce score significantly if excluded topics are present
      score -= EXCLUDED_TOPIC_PENALTY * (excludedMatches / article.topics.length);
    }
  }

  // Normalize score to 0-1 range
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0.5;

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, normalizedScore));
}

/**
 * Calculate and update relevance scores for all articles
 */
export function updateAllRelevanceScores(): number {
  const preferences = UserPreferencesModel.get();
  const articles = ArticleModel.findAll();

  let updatedCount = 0;

  for (const article of articles) {
    const relevanceScore = calculateRelevanceScore(article, preferences);
    ArticleModel.update(article.id, { relevanceScore });
    updatedCount++;
  }

  return updatedCount;
}

/**
 * Calculate and update relevance score for a single article
 */
export function updateArticleRelevanceScore(articleId: string): number | null {
  const article = ArticleModel.findById(articleId);
  if (!article) {
    return null;
  }

  const preferences = UserPreferencesModel.get();
  const relevanceScore = calculateRelevanceScore(article, preferences);

  ArticleModel.update(articleId, { relevanceScore });

  return relevanceScore;
}

/**
 * Get articles sorted by relevance score
 */
export function getArticlesByRelevance(minScore: number = 0, limit?: number): Article[] {
  return ArticleModel.findByRelevanceScore(minScore, limit);
}
