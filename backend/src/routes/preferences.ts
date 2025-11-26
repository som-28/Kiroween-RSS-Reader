import { Router, Request, Response } from 'express';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import { updateAllRelevanceScores } from '../services/relevanceScoring.js';
import { updateDigestSchedule } from '../services/digestScheduler.js';

const router = Router();

/**
 * GET /api/preferences - Get user preferences
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    const preferences = UserPreferencesModel.get();
    res.json({ preferences });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      error: 'Failed to fetch preferences',
      details: error.message,
    });
  }
});

/**
 * PUT /api/preferences - Update user preferences
 */
router.put('/', (req: Request, res: Response): void => {
  try {
    const {
      interests,
      excludedTopics,
      preferredSources,
      digestFrequency,
      digestTime,
      digestArticleCount,
      enableNotifications,
      notificationThreshold,
      theme,
      enableAnimations,
      enableSoundEffects,
      summaryLength,
      audioVoice,
      audioSpeed,
    } = req.body;

    // Validate interests and excludedTopics are arrays if provided
    if (interests !== undefined && !Array.isArray(interests)) {
      res.status(400).json({
        error: 'interests must be an array of strings',
      });
      return;
    }

    if (excludedTopics !== undefined && !Array.isArray(excludedTopics)) {
      res.status(400).json({
        error: 'excludedTopics must be an array of strings',
      });
      return;
    }

    if (preferredSources !== undefined && !Array.isArray(preferredSources)) {
      res.status(400).json({
        error: 'preferredSources must be an array of strings',
      });
      return;
    }

    // Validate digestFrequency
    if (digestFrequency !== undefined && !['daily', 'weekly', 'off'].includes(digestFrequency)) {
      res.status(400).json({
        error: 'digestFrequency must be "daily", "weekly", or "off"',
      });
      return;
    }

    // Validate theme
    if (theme !== undefined && !['graveyard', 'haunted-mansion', 'witch-cottage'].includes(theme)) {
      res.status(400).json({
        error: 'theme must be "graveyard", "haunted-mansion", or "witch-cottage"',
      });
      return;
    }

    // Validate summaryLength
    if (summaryLength !== undefined && !['short', 'medium', 'long'].includes(summaryLength)) {
      res.status(400).json({
        error: 'summaryLength must be "short", "medium", or "long"',
      });
      return;
    }

    // Validate notificationThreshold
    if (
      notificationThreshold !== undefined &&
      (notificationThreshold < 0 || notificationThreshold > 1)
    ) {
      res.status(400).json({
        error: 'notificationThreshold must be between 0 and 1',
      });
      return;
    }

    // Validate audioSpeed
    if (audioSpeed !== undefined && (audioSpeed < 0.5 || audioSpeed > 2.0)) {
      res.status(400).json({
        error: 'audioSpeed must be between 0.5 and 2.0',
      });
      return;
    }

    // Update preferences
    const updatedPreferences = UserPreferencesModel.update({
      interests,
      excludedTopics,
      preferredSources,
      digestFrequency,
      digestTime,
      digestArticleCount,
      enableNotifications,
      notificationThreshold,
      theme,
      enableAnimations,
      enableSoundEffects,
      summaryLength,
      audioVoice,
      audioSpeed,
    });

    // If interests or excludedTopics changed, recalculate relevance scores
    if (interests !== undefined || excludedTopics !== undefined) {
      const updatedCount = updateAllRelevanceScores();
      console.log(`🎃 Recalculated relevance scores for ${updatedCount} articles`);
    }

    // If digest preferences changed, update the scheduler
    if (digestFrequency !== undefined || digestTime !== undefined) {
      updateDigestSchedule();
      console.log(`🎃 Updated digest schedule`);
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      details: error.message,
    });
  }
});

/**
 * POST /api/preferences/reset - Reset preferences to defaults
 */
router.post('/reset', (_req: Request, res: Response): void => {
  try {
    const preferences = UserPreferencesModel.reset();

    // Recalculate relevance scores with default preferences
    const updatedCount = updateAllRelevanceScores();
    console.log(`🎃 Recalculated relevance scores for ${updatedCount} articles`);

    // Update digest schedule with default preferences
    updateDigestSchedule();
    console.log(`🎃 Reset digest schedule to defaults`);

    res.json({
      message: 'Preferences reset to defaults',
      preferences,
    });
  } catch (error: any) {
    console.error('Error resetting preferences:', error);
    res.status(500).json({
      error: 'Failed to reset preferences',
      details: error.message,
    });
  }
});

export default router;
