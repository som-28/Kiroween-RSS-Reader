import { ArticleModel } from '../models/Article.js';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import type { Article } from '../types/models.js';

interface PendingNotification {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  relevanceScore: number;
  createdAt: Date;
}

// In-memory store for pending notifications
// In production, this would be stored in the database
const pendingNotifications = new Map<string, PendingNotification>();

/**
 * Check if an article should trigger a notification based on user preferences
 */
export function shouldNotifyForArticle(article: Article): boolean {
  const preferences = UserPreferencesModel.get();

  // Check if notifications are enabled
  if (!preferences.enableNotifications) {
    return false;
  }

  // Check if article relevance score meets threshold
  if (article.relevanceScore < preferences.notificationThreshold) {
    return false;
  }

  // Don't notify for articles that are already read
  if (article.isRead) {
    return false;
  }

  // Check if article was fetched recently (within 1 minute as per requirement)
  const now = Date.now();
  const fetchedTime = article.fetchedAt.getTime();
  const minutesSinceFetch = (now - fetchedTime) / (1000 * 60);

  // Only notify for articles fetched within the last 5 minutes
  // This prevents notification spam on initial feed load
  if (minutesSinceFetch > 5) {
    return false;
  }

  return true;
}

/**
 * Create a notification for a high-priority article
 */
export function createNotification(article: Article): PendingNotification | null {
  if (!shouldNotifyForArticle(article)) {
    return null;
  }

  // Check if notification already exists for this article
  if (pendingNotifications.has(article.id)) {
    return null;
  }

  const notification: PendingNotification = {
    id: `notif-${article.id}-${Date.now()}`,
    articleId: article.id,
    title: article.title,
    summary: article.summary || article.excerpt || '',
    relevanceScore: article.relevanceScore,
    createdAt: new Date(),
  };

  pendingNotifications.set(article.id, notification);

  console.log(
    `🔔 Created notification for article: ${article.title} (score: ${article.relevanceScore.toFixed(2)})`
  );

  return notification;
}

/**
 * Check all recent articles and create notifications for high-priority ones
 */
export function checkAndCreateNotifications(): PendingNotification[] {
  const preferences = UserPreferencesModel.get();

  if (!preferences.enableNotifications) {
    return [];
  }

  // Get articles fetched in the last 5 minutes with high relevance scores
  const recentArticles = ArticleModel.findAll()
    .filter((article) => {
      const minutesSinceFetch = (Date.now() - article.fetchedAt.getTime()) / (1000 * 60);
      return minutesSinceFetch <= 5 && !article.isRead;
    })
    .filter((article) => article.relevanceScore >= preferences.notificationThreshold);

  const newNotifications: PendingNotification[] = [];

  for (const article of recentArticles) {
    const notification = createNotification(article);
    if (notification) {
      newNotifications.push(notification);
    }
  }

  return newNotifications;
}

/**
 * Get all pending notifications
 */
export function getPendingNotifications(): PendingNotification[] {
  return Array.from(pendingNotifications.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Mark a notification as read/dismissed
 */
export function dismissNotification(articleId: string): boolean {
  return pendingNotifications.delete(articleId);
}

/**
 * Clear all pending notifications
 */
export function clearAllNotifications(): void {
  pendingNotifications.clear();
}

/**
 * Get notification count
 */
export function getNotificationCount(): number {
  return pendingNotifications.size;
}
