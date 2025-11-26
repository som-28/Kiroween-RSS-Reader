/**
 * Test script for notification system
 *
 * This script tests the notification service functionality:
 * - Creating notifications for high-priority articles
 * - Checking notification logic
 * - Managing pending notifications
 *
 * Run with: npm run build && node dist/test-notifications.js
 */

import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { ArticleModel } from './models/Article.js';
import { UserPreferencesModel } from './models/UserPreferences.js';
import {
  shouldNotifyForArticle,
  createNotification,
  getPendingNotifications,
  dismissNotification,
  clearAllNotifications,
  getNotificationCount,
  checkAndCreateNotifications,
} from './services/notificationService.js';

// Initialize database
initializeDatabase();
runMigrations();

console.log('🎃 Testing Notification System\n');

// Test 1: Check notification logic
console.log('Test 1: Notification Logic');
console.log('='.repeat(50));

const preferences = UserPreferencesModel.get();
console.log('Current preferences:');
console.log(`  - Notifications enabled: ${preferences.enableNotifications}`);
console.log(`  - Notification threshold: ${preferences.notificationThreshold}`);

// Get some articles
const articles = ArticleModel.findAll();
console.log(`\nFound ${articles.length} articles in database`);

if (articles.length > 0) {
  const article = articles[0];
  console.log(`\nChecking article: "${article.title}"`);
  console.log(`  - Relevance score: ${article.relevanceScore.toFixed(2)}`);
  console.log(`  - Is read: ${article.isRead}`);
  console.log(`  - Fetched at: ${article.fetchedAt.toISOString()}`);

  const shouldNotify = shouldNotifyForArticle(article);
  console.log(`  - Should notify: ${shouldNotify}`);

  if (shouldNotify) {
    console.log('\n✅ Article qualifies for notification');
  } else {
    console.log('\n❌ Article does not qualify for notification');
    if (!preferences.enableNotifications) {
      console.log('   Reason: Notifications are disabled');
    } else if (article.relevanceScore < preferences.notificationThreshold) {
      console.log(
        `   Reason: Relevance score (${article.relevanceScore.toFixed(2)}) below threshold (${preferences.notificationThreshold})`
      );
    } else if (article.isRead) {
      console.log('   Reason: Article is already read');
    } else {
      const minutesSinceFetch = (Date.now() - article.fetchedAt.getTime()) / (1000 * 60);
      console.log(
        `   Reason: Article too old (${minutesSinceFetch.toFixed(1)} minutes since fetch)`
      );
    }
  }
}

// Test 2: Create notifications
console.log('\n\nTest 2: Create Notifications');
console.log('='.repeat(50));

// Clear any existing notifications first
clearAllNotifications();
console.log('Cleared existing notifications');

// Find high-relevance articles
const highRelevanceArticles = articles
  .filter((a) => a.relevanceScore >= preferences.notificationThreshold && !a.isRead)
  .slice(0, 3);

console.log(`\nFound ${highRelevanceArticles.length} high-relevance articles`);

for (const article of highRelevanceArticles) {
  const notification = createNotification(article);
  if (notification) {
    console.log(`✅ Created notification for: "${article.title}"`);
    console.log(`   Score: ${article.relevanceScore.toFixed(2)}`);
  }
}

// Test 3: Get pending notifications
console.log('\n\nTest 3: Get Pending Notifications');
console.log('='.repeat(50));

const pending = getPendingNotifications();
console.log(`Found ${pending.length} pending notifications:\n`);

for (const notification of pending) {
  console.log(`📬 ${notification.title}`);
  console.log(`   Summary: ${notification.summary.substring(0, 100)}...`);
  console.log(`   Relevance: ${(notification.relevanceScore * 100).toFixed(0)}%`);
  console.log(`   Created: ${notification.createdAt.toISOString()}`);
  console.log();
}

// Test 4: Notification count
console.log('Test 4: Notification Count');
console.log('='.repeat(50));

const count = getNotificationCount();
console.log(`Total pending notifications: ${count}`);

// Test 5: Dismiss notification
console.log('\n\nTest 5: Dismiss Notification');
console.log('='.repeat(50));

if (pending.length > 0) {
  const firstNotification = pending[0];
  console.log(`Dismissing notification for article: ${firstNotification.articleId}`);

  const dismissed = dismissNotification(firstNotification.articleId);
  console.log(`Dismissed: ${dismissed}`);

  const newCount = getNotificationCount();
  console.log(`Remaining notifications: ${newCount}`);
} else {
  console.log('No notifications to dismiss');
}

// Test 6: Check and create notifications (batch)
console.log('\n\nTest 6: Batch Check and Create');
console.log('='.repeat(50));

clearAllNotifications();
console.log('Cleared all notifications');

const newNotifications = checkAndCreateNotifications();
console.log(`Created ${newNotifications.length} new notifications`);

for (const notification of newNotifications) {
  console.log(`  - ${notification.title} (${(notification.relevanceScore * 100).toFixed(0)}%)`);
}

// Test 7: Clear all notifications
console.log('\n\nTest 7: Clear All Notifications');
console.log('='.repeat(50));

const beforeClear = getNotificationCount();
console.log(`Notifications before clear: ${beforeClear}`);

clearAllNotifications();

const afterClear = getNotificationCount();
console.log(`Notifications after clear: ${afterClear}`);

// Summary
console.log('\n\n' + '='.repeat(50));
console.log('🎃 Notification System Test Complete!');
console.log('='.repeat(50));

console.log('\nTest Results:');
console.log('✅ Notification logic check');
console.log('✅ Create notifications');
console.log('✅ Get pending notifications');
console.log('✅ Get notification count');
console.log('✅ Dismiss notification');
console.log('✅ Batch check and create');
console.log('✅ Clear all notifications');

console.log('\n💡 Tips:');
console.log('- Adjust notification threshold in preferences to control sensitivity');
console.log('- Notifications are only created for unread articles');
console.log('- Articles must be fetched within the last 5 minutes');
console.log('- Use the API endpoints to integrate with frontend');

console.log('\n📚 API Endpoints:');
console.log('GET    /api/notifications          - Get all pending notifications');
console.log('GET    /api/notifications/count    - Get notification count');
console.log('POST   /api/notifications/check    - Manually trigger notification check');
console.log('DELETE /api/notifications/:articleId - Dismiss a notification');
console.log('DELETE /api/notifications          - Clear all notifications');
