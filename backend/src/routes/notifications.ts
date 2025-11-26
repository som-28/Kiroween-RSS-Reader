import express from 'express';
import {
  getPendingNotifications,
  dismissNotification,
  clearAllNotifications,
  getNotificationCount,
  checkAndCreateNotifications,
} from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all pending notifications
 */
router.get('/', (_req, res) => {
  try {
    const notifications = getPendingNotifications();
    res.json({
      notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/count
 * Get notification count
 */
router.get('/count', (_req, res) => {
  try {
    const count = getNotificationCount();
    res.json({ count });
  } catch (error: any) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/check
 * Manually trigger notification check
 */
router.post('/check', (_req, res) => {
  try {
    const newNotifications = checkAndCreateNotifications();
    res.json({
      notifications: newNotifications,
      count: newNotifications.length,
    });
  } catch (error: any) {
    console.error('Error checking notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications/:articleId
 * Dismiss a notification for a specific article
 */
router.delete('/:articleId', (req, res) => {
  try {
    const { articleId } = req.params;
    const dismissed = dismissNotification(articleId);

    if (dismissed) {
      res.json({ message: 'Notification dismissed' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error: any) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications
 * Clear all notifications
 */
router.delete('/', (_req, res) => {
  try {
    clearAllNotifications();
    res.json({ message: 'All notifications cleared' });
  } catch (error: any) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
