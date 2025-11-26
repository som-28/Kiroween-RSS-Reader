import { Router, Request, Response } from 'express';
import {
  getTrendingTopics,
  getTrendingEntities,
  getTrendingAll,
} from '../services/trendingService.js';

const router = Router();

/**
 * GET /api/topics - Get all unique topics
 * Returns a list of all unique topics from articles
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { db } = await import('../config/database.js');

    // Get all topics from articles
    const stmt = db.prepare('SELECT DISTINCT topics FROM articles WHERE topics IS NOT NULL');
    const rows = stmt.all();

    // Extract unique topics
    const topicsSet = new Set<string>();
    rows.forEach((row: any) => {
      if (row.topics) {
        try {
          const topics = JSON.parse(row.topics) as string[];
          topics.forEach((topic) => topicsSet.add(topic));
        } catch (e) {
          // Skip invalid JSON
        }
      }
    });

    const uniqueTopics = Array.from(topicsSet).sort();

    res.json({
      topics: uniqueTopics,
      count: uniqueTopics.length,
    });
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      error: 'Failed to fetch topics',
      details: error.message,
    });
  }
});

/**
 * GET /api/topics/trending - Get trending topics
 * Returns top 10 trending topics based on frequency and recency
 */
router.get('/trending', (req: Request, res: Response): void => {
  try {
    const { days, limit, type } = req.query;

    const daysBack = days ? parseInt(days as string) : 7;
    const maxLimit = limit ? Math.min(parseInt(limit as string), 50) : 10;

    let trendingData;

    if (type === 'entities') {
      trendingData = getTrendingEntities(daysBack, maxLimit);
    } else if (type === 'all') {
      trendingData = getTrendingAll(daysBack, maxLimit);
    } else {
      // Default to topics only
      trendingData = getTrendingTopics(daysBack, maxLimit);
    }

    res.json({
      trending: trendingData,
      count: trendingData.length,
      period: {
        days: daysBack,
        endDate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching trending topics:', error);
    res.status(500).json({
      error: 'Failed to fetch trending topics',
      details: error.message,
    });
  }
});

export default router;
