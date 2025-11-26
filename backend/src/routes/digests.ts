import express from 'express';
import { DigestModel } from '../models/Digest.js';
import { ArticleModel } from '../models/Article.js';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import {
  createDigest,
  generateDailyDigest,
  generateWeeklyDigest,
} from '../services/digestService.js';
import { updateDigestSchedule } from '../services/digestScheduler.js';

const router = express.Router();

/**
 * GET /api/digests/latest
 * Get the latest digest
 */
router.get('/latest', async (_req, res) => {
  try {
    const latestDigest = DigestModel.findLatest();

    if (!latestDigest) {
      return res.status(404).json({
        error: 'No digests found',
        message: 'No digests have been generated yet. Try generating one manually.',
      });
    }

    // Get full article data for the digest
    const articles = latestDigest.articleIds
      .map((id) => ArticleModel.findById(id))
      .filter((article) => article !== null);

    return res.json({
      digest: latestDigest,
      articles,
    });
  } catch (error: any) {
    console.error('Error fetching latest digest:', error);
    return res.status(500).json({
      error: 'Failed to fetch latest digest',
      message: error.message,
    });
  }
});

/**
 * GET /api/digests
 * Get all digests with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { type, limit } = req.query;

    let digests;

    if (type && (type === 'daily' || type === 'weekly' || type === 'custom')) {
      const limitNum = limit ? parseInt(limit as string, 10) : undefined;
      digests = DigestModel.findByType(type, limitNum);
    } else {
      const limitNum = limit ? parseInt(limit as string, 10) : undefined;
      digests = DigestModel.findAll(limitNum);
    }

    return res.json({ digests });
  } catch (error: any) {
    console.error('Error fetching digests:', error);
    return res.status(500).json({
      error: 'Failed to fetch digests',
      message: error.message,
    });
  }
});

/**
 * GET /api/digests/:id
 * Get a specific digest by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const digest = DigestModel.findById(id);

    if (!digest) {
      return res.status(404).json({
        error: 'Digest not found',
        message: `No digest found with ID: ${id}`,
      });
    }

    // Get full article data for the digest
    const articles = digest.articleIds
      .map((articleId) => ArticleModel.findById(articleId))
      .filter((article) => article !== null);

    return res.json({
      digest,
      articles,
    });
  } catch (error: any) {
    console.error('Error fetching digest:', error);
    return res.status(500).json({
      error: 'Failed to fetch digest',
      message: error.message,
    });
  }
});

/**
 * POST /api/digests/generate
 * Generate a new digest on-demand
 */
router.post('/generate', async (req, res) => {
  try {
    const { type, periodStart, periodEnd, articleCount } = req.body;

    // Validate type
    if (!type || !['daily', 'weekly', 'custom'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid digest type',
        message: 'Type must be one of: daily, weekly, custom',
      });
    }

    let digest;

    if (type === 'daily') {
      // Generate daily digest
      digest = await generateDailyDigest();
    } else if (type === 'weekly') {
      // Generate weekly digest
      digest = await generateWeeklyDigest();
    } else if (type === 'custom') {
      // Generate custom digest with specified parameters
      if (!periodStart || !periodEnd) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'Custom digest requires periodStart and periodEnd dates',
        });
      }

      const start = new Date(periodStart);
      const end = new Date(periodEnd);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Invalid dates',
          message: 'periodStart and periodEnd must be valid ISO date strings',
        });
      }

      if (start >= end) {
        return res.status(400).json({
          error: 'Invalid date range',
          message: 'periodStart must be before periodEnd',
        });
      }

      digest = await createDigest(type, start, end, articleCount);
    }

    // Get full article data for the digest
    const articles = digest!.articleIds
      .map((id) => ArticleModel.findById(id))
      .filter((article) => article !== null);

    return res.status(201).json({
      message: 'Digest generated successfully',
      digest,
      articles,
    });
  } catch (error: any) {
    console.error('Error generating digest:', error);
    return res.status(500).json({
      error: 'Failed to generate digest',
      message: error.message,
    });
  }
});

/**
 * PUT /api/digests/preferences
 * Update digest preferences (frequency, time, article count)
 */
router.put('/preferences', async (req, res) => {
  try {
    const { digestFrequency, digestTime, digestArticleCount } = req.body;

    // Validate inputs
    if (digestFrequency && !['daily', 'weekly', 'off'].includes(digestFrequency)) {
      return res.status(400).json({
        error: 'Invalid digest frequency',
        message: 'Frequency must be one of: daily, weekly, off',
      });
    }

    if (digestTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(digestTime)) {
        return res.status(400).json({
          error: 'Invalid time format',
          message: 'Time must be in HH:MM format (e.g., 09:00)',
        });
      }
    }

    if (digestArticleCount !== undefined) {
      const count = parseInt(digestArticleCount, 10);
      if (isNaN(count) || count < 1 || count > 50) {
        return res.status(400).json({
          error: 'Invalid article count',
          message: 'Article count must be between 1 and 50',
        });
      }
    }

    // Update preferences
    const updatedPreferences = UserPreferencesModel.update({
      digestFrequency,
      digestTime,
      digestArticleCount,
    });

    // Update the digest scheduler with new preferences
    updateDigestSchedule();

    return res.json({
      message: 'Digest preferences updated successfully',
      preferences: {
        digestFrequency: updatedPreferences.digestFrequency,
        digestTime: updatedPreferences.digestTime,
        digestArticleCount: updatedPreferences.digestArticleCount,
      },
    });
  } catch (error: any) {
    console.error('Error updating digest preferences:', error);
    return res.status(500).json({
      error: 'Failed to update digest preferences',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/digests/:id
 * Delete a specific digest
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = DigestModel.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Digest not found',
        message: `No digest found with ID: ${id}`,
      });
    }

    return res.json({
      message: 'Digest deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting digest:', error);
    return res.status(500).json({
      error: 'Failed to delete digest',
      message: error.message,
    });
  }
});

export default router;
