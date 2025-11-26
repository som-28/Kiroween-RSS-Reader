import { Router, Request, Response } from 'express';
import { loadDemoContent, isDemoContentLoaded } from '../services/demoContent.js';

const router = Router();

/**
 * GET /api/demo/status - Check if demo content is loaded
 */
router.get('/status', (_req: Request, res: Response): void => {
  try {
    const isLoaded = isDemoContentLoaded();
    res.json({
      demoContentLoaded: isLoaded,
    });
  } catch (error: any) {
    console.error('Error checking demo content status:', error);
    res.status(500).json({
      error: 'Failed to check demo content status',
      details: error.message,
    });
  }
});

/**
 * POST /api/demo/load - Manually load demo content
 */
router.post('/load', async (_req: Request, res: Response): Promise<void> => {
  try {
    await loadDemoContent();
    res.json({
      message: 'Demo content loaded successfully',
    });
  } catch (error: any) {
    console.error('Error loading demo content:', error);
    res.status(500).json({
      error: 'Failed to load demo content',
      details: error.message,
    });
  }
});

export default router;
