import { Router, Request, Response } from 'express';
import { FeedModel } from '../models/Feed.js';
import { validateFeedUrl, fetchFeed } from '../services/feedParser.js';
import type { CreateFeedInput } from '../types/models.js';

const router = Router();

/**
 * POST /api/feeds - Add a new feed
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, title, description, fetchInterval } = req.body;

    // Validate required fields
    if (!url) {
      res.status(400).json({
        error: 'URL is required',
      });
      return;
    }

    // Check if feed already exists
    const existingFeed = FeedModel.findByUrl(url);
    if (existingFeed) {
      res.status(409).json({
        error: 'Feed already exists',
        feed: existingFeed,
      });
      return;
    }

    // Validate feed URL
    const validation = await validateFeedUrl(url);
    if (!validation.isValid) {
      res.status(400).json({
        error: validation.error || 'Invalid feed URL',
      });
      return;
    }

    // If title not provided, fetch it from the feed
    let feedTitle = title;
    let feedDescription = description;

    if (!feedTitle) {
      try {
        const Parser = (await import('rss-parser')).default;
        const parser = new Parser();
        const feedData = await parser.parseURL(url);
        feedTitle = feedData.title || 'Untitled Feed';
        feedDescription = feedDescription || feedData.description || '';
      } catch (error) {
        feedTitle = 'Untitled Feed';
      }
    }

    // Create feed
    const feedInput: CreateFeedInput = {
      url,
      title: feedTitle,
      description: feedDescription,
      fetchInterval: fetchInterval || 60,
    };

    const feed = FeedModel.create(feedInput);

    // Fetch initial articles in the background
    fetchFeed(feed.id).catch((error) => {
      console.error(`Failed to fetch initial articles for feed ${feed.id}:`, error);
    });

    res.status(201).json({
      message: 'Feed added successfully',
      feed,
    });
  } catch (error: any) {
    console.error('Error adding feed:', error);
    res.status(500).json({
      error: 'Failed to add feed',
      details: error.message,
    });
  }
});

/**
 * GET /api/feeds - List all feeds
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    const feeds = FeedModel.findAll();
    res.json({
      feeds,
      count: feeds.length,
    });
  } catch (error: any) {
    console.error('Error fetching feeds:', error);
    res.status(500).json({
      error: 'Failed to fetch feeds',
      details: error.message,
    });
  }
});

/**
 * GET /api/feeds/:id - Get a single feed
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const feed = FeedModel.findById(id);

    if (!feed) {
      res.status(404).json({
        error: 'Feed not found',
      });
      return;
    }

    res.json({ feed });
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      error: 'Failed to fetch feed',
      details: error.message,
    });
  }
});

/**
 * PUT /api/feeds/:id/refresh - Manually refresh a feed
 */
router.put('/:id/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const feed = FeedModel.findById(id);

    if (!feed) {
      res.status(404).json({
        error: 'Feed not found',
      });
      return;
    }

    // Fetch feed
    const result = await fetchFeed(id);

    if (result.success) {
      const updatedFeed = FeedModel.findById(id);
      res.json({
        message: 'Feed refreshed successfully',
        articlesAdded: result.articlesAdded,
        feed: updatedFeed,
      });
    } else {
      res.status(500).json({
        error: 'Failed to refresh feed',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error refreshing feed:', error);
    res.status(500).json({
      error: 'Failed to refresh feed',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/feeds/:id - Remove a feed
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const feed = FeedModel.findById(id);

    if (!feed) {
      res.status(404).json({
        error: 'Feed not found',
      });
      return;
    }

    const deleted = FeedModel.delete(id);

    if (deleted) {
      res.json({
        message: 'Feed deleted successfully',
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete feed',
      });
    }
  } catch (error: any) {
    console.error('Error deleting feed:', error);
    res.status(500).json({
      error: 'Failed to delete feed',
      details: error.message,
    });
  }
});

/**
 * PUT /api/feeds/:id - Update feed settings
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, description, fetchInterval, status } = req.body;

    const feed = FeedModel.findById(id);
    if (!feed) {
      res.status(404).json({
        error: 'Feed not found',
      });
      return;
    }

    const updatedFeed = FeedModel.update(id, {
      title,
      description,
      fetchInterval,
      status,
    });

    res.json({
      message: 'Feed updated successfully',
      feed: updatedFeed,
    });
  } catch (error: any) {
    console.error('Error updating feed:', error);
    res.status(500).json({
      error: 'Failed to update feed',
      details: error.message,
    });
  }
});

export default router;
