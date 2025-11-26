import { Router, Request, Response } from 'express';
import { ArticleModel } from '../models/Article.js';
import { generateArticleAnalysis } from '../services/aiService.js';
import { processFeedback } from '../services/feedbackLearning.js';

const router = Router();

/**
 * GET /api/articles - Get all articles with optional filters
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedId, limit, offset, topics, startDate, endDate, isRead, isFavorite } = req.query;

    const parsedLimit = limit ? parseInt(limit as string) : undefined;
    const parsedOffset = offset ? parseInt(offset as string) : undefined;

    // Build filter conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (feedId) {
      conditions.push('feed_id = ?');
      params.push(feedId);
    }

    if (isRead !== undefined) {
      conditions.push('is_read = ?');
      params.push(isRead === 'true' ? 1 : 0);
    }

    if (isFavorite !== undefined) {
      conditions.push('is_favorite = ?');
      params.push(isFavorite === 'true' ? 1 : 0);
    }

    if (startDate) {
      conditions.push('published_at >= ?');
      params.push(new Date(startDate as string).toISOString());
    }

    if (endDate) {
      conditions.push('published_at <= ?');
      params.push(new Date(endDate as string).toISOString());
    }

    // Handle topics filter
    if (topics) {
      const topicArray = Array.isArray(topics) ? topics : [topics];
      const topicConditions = topicArray.map(() => 'topics LIKE ?').join(' OR ');
      if (topicConditions) {
        conditions.push(`(${topicConditions})`);
        topicArray.forEach((topic) => {
          params.push(`%"${topic}"%`);
        });
      }
    }

    // Build query
    let query = 'SELECT * FROM articles';
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY relevance_score DESC, published_at DESC';

    if (parsedLimit) {
      query += ` LIMIT ${parsedLimit}`;
      if (parsedOffset) {
        query += ` OFFSET ${parsedOffset}`;
      }
    }

    // Import db dynamically
    const { db } = await import('../config/database.js');
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    // Convert rows to Article objects
    const articles = rows.map((row: any) => ({
      id: row.id,
      feedId: row.feed_id,
      title: row.title,
      link: row.link,
      content: row.content,
      excerpt: row.excerpt,
      author: row.author,
      publishedAt: new Date(row.published_at),
      fetchedAt: new Date(row.fetched_at),
      summary: row.summary,
      topics: row.topics ? JSON.parse(row.topics) : [],
      entities: row.entities ? JSON.parse(row.entities) : [],
      sentiment: row.sentiment,
      relevanceScore: row.relevance_score,
      embedding: row.embedding ? JSON.parse(row.embedding) : null,
      isRead: Boolean(row.is_read),
      isFavorite: Boolean(row.is_favorite),
      userFeedback: row.user_feedback,
      audioUrl: row.audio_url,
      audioDuration: row.audio_duration,
    }));

    res.json({
      articles,
      count: articles.length,
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
      details: error.message,
    });
  }
});

/**
 * GET /api/articles/:id - Get a single article
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const article = ArticleModel.findById(id);

    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    res.json({ article });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      error: 'Failed to fetch article',
      details: error.message,
    });
  }
});

/**
 * GET /api/articles/:id/summary - Get AI-generated summary for an article
 * Triggers AI summarization if not already cached
 */
router.get('/:id/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if article exists
    const article = ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    // Generate or retrieve cached analysis
    const analysis = await generateArticleAnalysis(id);

    if (!analysis) {
      res.status(500).json({
        error: 'Failed to generate article summary',
        fallback: {
          summary: article.excerpt || article.content.substring(0, 300),
          topics: [],
          entities: [],
        },
      });
      return;
    }

    res.json({
      articleId: id,
      summary: analysis.summary,
      topics: analysis.topics,
      entities: analysis.entities,
      cached: article.summary !== null,
    });
  } catch (error: any) {
    console.error('Error generating article summary:', error);

    // Handle rate limiting errors
    if (error.message?.includes('rate limit') || error.status === 429) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to AI service. Please try again later.',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to generate article summary',
      details: error.message,
    });
  }
});

/**
 * PUT /api/articles/:id - Update article metadata
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { isRead, isFavorite, userFeedback } = req.body;

    const article = ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    const updatedArticle = ArticleModel.update(id, {
      isRead,
      isFavorite,
      userFeedback,
    });

    res.json({
      message: 'Article updated successfully',
      article: updatedArticle,
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    res.status(500).json({
      error: 'Failed to update article',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/articles/:id - Update article metadata (partial update)
 */
router.patch('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { isRead, isFavorite, userFeedback } = req.body;

    const article = ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    const updatedArticle = ArticleModel.update(id, {
      isRead,
      isFavorite,
      userFeedback,
    });

    res.json(updatedArticle);
  } catch (error: any) {
    console.error('Error updating article:', error);
    res.status(500).json({
      error: 'Failed to update article',
      details: error.message,
    });
  }
});

/**
 * POST /api/articles/:id/feedback - Submit user feedback for an article
 * Updates preference weights and recalculates relevance scores
 */
router.post('/:id/feedback', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || !['like', 'dislike'].includes(feedback)) {
      res.status(400).json({
        error: 'Invalid feedback value. Must be "like" or "dislike"',
      });
      return;
    }

    const article = ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    // Update article feedback
    const updatedArticle = ArticleModel.update(id, {
      userFeedback: feedback,
    });

    // Process feedback and update preference weights
    const learningResult = processFeedback(id, feedback);

    if (!learningResult.success) {
      res.status(500).json({
        error: 'Failed to process feedback',
        details: learningResult.error,
      });
      return;
    }

    res.json({
      message: 'Feedback recorded and preferences updated',
      article: updatedArticle,
      learning: {
        weightsUpdated: learningResult.weightsUpdated,
      },
    });
  } catch (error: any) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      error: 'Failed to record feedback',
      details: error.message,
    });
  }
});

/**
 * GET /api/articles/:id/audio - Generate or retrieve audio summary
 * Generates audio if not already cached, returns audio URL and duration
 */
router.get('/:id/audio', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { voice, speed } = req.query;

    // Check if article exists
    const article = ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    // Import TTS service
    const { generateArticleAudio, isValidVoice } = await import('../services/ttsService.js');

    // Validate voice if provided
    if (voice && !isValidVoice(voice as string)) {
      res.status(400).json({
        error: 'Invalid voice ID',
        message: 'Please provide a valid voice ID',
      });
      return;
    }

    // Validate speed if provided
    let validSpeed: number | undefined;
    if (speed) {
      validSpeed = parseFloat(speed as string);
      if (isNaN(validSpeed) || validSpeed < 0.5 || validSpeed > 2.0) {
        res.status(400).json({
          error: 'Invalid speed value',
          message: 'Speed must be between 0.5 and 2.0',
        });
        return;
      }
    }

    // Generate or retrieve cached audio
    const audioResult = await generateArticleAudio(id, voice as string | undefined, validSpeed);

    if (!audioResult) {
      res.status(500).json({
        error: 'Failed to generate audio summary',
        message: 'Audio generation service is unavailable or failed. Please try again later.',
      });
      return;
    }

    res.json({
      articleId: id,
      audioUrl: audioResult.audioUrl,
      duration: audioResult.duration,
      cached: article.audioUrl !== null,
    });
  } catch (error: any) {
    console.error('Error generating audio summary:', error);

    // Handle rate limiting errors
    if (error.response?.status === 429 || error.message?.includes('rate limit')) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many audio generation requests. Please try again later.',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to generate audio summary',
      details: error.message,
    });
  }
});

/**
 * GET /api/articles/:id/related - Get related articles
 * Returns top 5 related articles with connection strength and shared elements
 */
router.get('/:id/related', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    // Check if article exists
    const article = ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({
        error: 'Article not found',
      });
      return;
    }

    // Import similarity service
    const { findSimilarArticles } = await import('../services/similarityService.js');

    // Get related articles
    const maxLimit = limit ? Math.min(parseInt(limit as string), 20) : 5;
    const relatedArticles = findSimilarArticles(id, maxLimit);

    // Format response
    const formattedResults = relatedArticles.map((item: any) => ({
      article: {
        id: item.article.id,
        title: item.article.title,
        link: item.article.link,
        excerpt: item.article.excerpt,
        summary: item.article.summary,
        topics: item.article.topics,
        entities: item.article.entities,
        publishedAt: item.article.publishedAt,
        relevanceScore: item.article.relevanceScore,
      },
      connection: {
        type: item.connection.type,
        strength: item.connection.strength,
        sharedTopics: item.connection.sharedElements.filter((el: string) =>
          article.topics.map((t: string) => t.toLowerCase()).includes(el.toLowerCase())
        ),
        sharedEntities: item.connection.sharedElements.filter((el: string) =>
          article.entities.map((e: string) => e.toLowerCase()).includes(el.toLowerCase())
        ),
      },
    }));

    res.json({
      articleId: id,
      relatedArticles: formattedResults,
      count: formattedResults.length,
    });
  } catch (error: any) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({
      error: 'Failed to fetch related articles',
      details: error.message,
    });
  }
});

export default router;
