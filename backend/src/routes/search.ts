import express from 'express';
import {
  searchArticles,
  getSearchSuggestions,
  type SearchFilters,
} from '../services/searchService.js';

const router = express.Router();

/**
 * GET /api/search
 * Search articles with filters and pagination
 *
 * Query parameters:
 * - q: search query string
 * - feedIds: comma-separated feed IDs
 * - topics: comma-separated topics
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - page: page number (default: 1)
 * - pageSize: results per page (default: 20)
 */
router.get('/', (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100); // Max 100 per page

    // Build filters
    const filters: SearchFilters = {};

    if (req.query.feedIds) {
      filters.feedIds = (req.query.feedIds as string).split(',').filter((id) => id.trim());
    }

    if (req.query.topics) {
      filters.topics = (req.query.topics as string).split(',').filter((t) => t.trim());
    }

    if (req.query.startDate) {
      try {
        filters.startDate = new Date(req.query.startDate as string);
      } catch (e) {
        res.status(400).json({ error: 'Invalid startDate format' });
        return;
      }
    }

    if (req.query.endDate) {
      try {
        filters.endDate = new Date(req.query.endDate as string);
      } catch (e) {
        res.status(400).json({ error: 'Invalid endDate format' });
        return;
      }
    }

    // Perform search
    const startTime = Date.now();
    const results = searchArticles(query, filters, page, pageSize);
    const duration = Date.now() - startTime;

    // Transform results to match frontend expectations
    res.json({
      articles: results.results.map((r) => r.article),
      total: results.total,
      page: results.page,
      pageSize: results.pageSize,
      hasMore: results.page < results.totalPages,
      query,
      filters,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search articles',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions based on query
 *
 * Query parameters:
 * - q: partial search query
 * - limit: max suggestions (default: 5)
 */
router.get('/suggestions', (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

    const suggestions = getSearchSuggestions(query, limit);

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
