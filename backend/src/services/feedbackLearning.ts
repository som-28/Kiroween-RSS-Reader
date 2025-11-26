import { ArticleModel } from '../models/Article.js';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import { PreferenceWeightModel } from '../models/PreferenceWeight.js';
import { updateAllRelevanceScores } from './relevanceScoring.js';

/**
 * Process user feedback on an article and update preference weights
 */
export function processFeedback(
  articleId: string,
  feedback: 'like' | 'dislike'
): { success: boolean; weightsUpdated: number; error?: string } {
  const article = ArticleModel.findById(articleId);

  if (!article) {
    return {
      success: false,
      weightsUpdated: 0,
      error: 'Article not found',
    };
  }

  const isPositive = feedback === 'like';
  const weightDelta = isPositive ? 0.1 : -0.1;

  let weightsUpdated = 0;

  // Update weights for all topics in the article
  for (const topic of article.topics) {
    PreferenceWeightModel.upsert(topic, weightDelta, isPositive);
    weightsUpdated++;
  }

  // Update weights for entities as well
  for (const entity of article.entities) {
    PreferenceWeightModel.upsert(entity, weightDelta * 0.5, isPositive); // Lower weight for entities
    weightsUpdated++;
  }

  // If positive feedback, consider adding topics to interests
  if (isPositive && article.topics.length > 0) {
    const preferences = UserPreferencesModel.get();
    const newInterests = [...preferences.interests];
    let interestsUpdated = false;

    for (const topic of article.topics) {
      const normalizedTopic = topic.toLowerCase();
      // Add topic to interests if not already present and not in excluded topics
      if (
        !newInterests.some((i) => i.toLowerCase() === normalizedTopic) &&
        !preferences.excludedTopics.some((e) => e.toLowerCase() === normalizedTopic)
      ) {
        newInterests.push(topic);
        interestsUpdated = true;
      }
    }

    if (interestsUpdated) {
      UserPreferencesModel.update({ interests: newInterests });
    }
  }

  // If negative feedback, consider adding topics to excluded topics
  if (!isPositive && article.topics.length > 0) {
    const preferences = UserPreferencesModel.get();
    const newExcludedTopics = [...preferences.excludedTopics];
    let excludedUpdated = false;

    for (const topic of article.topics) {
      const normalizedTopic = topic.toLowerCase();
      // Add topic to excluded if it appears frequently in disliked articles
      const weight = PreferenceWeightModel.getByTopic(normalizedTopic);
      if (
        weight &&
        weight.negativeFeedbackCount >= 3 &&
        !newExcludedTopics.some((e) => e.toLowerCase() === normalizedTopic)
      ) {
        newExcludedTopics.push(topic);
        excludedUpdated = true;
      }
    }

    if (excludedUpdated) {
      UserPreferencesModel.update({ excludedTopics: newExcludedTopics });
    }
  }

  // Recalculate relevance scores for all articles
  // This ensures the new weights are applied immediately
  updateAllRelevanceScores();

  return {
    success: true,
    weightsUpdated,
  };
}

/**
 * Get feedback statistics
 */
export function getFeedbackStats() {
  const weights = PreferenceWeightModel.getAll();

  const totalFeedback = weights.reduce(
    (sum, w) => sum + w.positiveFeedbackCount + w.negativeFeedbackCount,
    0
  );

  const topPositiveTopics = weights
    .filter((w) => w.positiveFeedbackCount > 0)
    .sort((a, b) => b.positiveFeedbackCount - a.positiveFeedbackCount)
    .slice(0, 10)
    .map((w) => ({
      topic: w.topic,
      count: w.positiveFeedbackCount,
      weight: w.weight,
    }));

  const topNegativeTopics = weights
    .filter((w) => w.negativeFeedbackCount > 0)
    .sort((a, b) => b.negativeFeedbackCount - a.negativeFeedbackCount)
    .slice(0, 10)
    .map((w) => ({
      topic: w.topic,
      count: w.negativeFeedbackCount,
      weight: w.weight,
    }));

  return {
    totalFeedback,
    totalTopics: weights.length,
    topPositiveTopics,
    topNegativeTopics,
  };
}
