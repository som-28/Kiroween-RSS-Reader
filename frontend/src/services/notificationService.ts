/**
 * Browser Notification Service
 * Handles Web Notifications API for high-priority articles
 */

export interface NotificationData {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  relevanceScore: number;
  createdAt: Date;
}

export type NotificationPermission = 'default' | 'granted' | 'denied';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission as NotificationPermission;
    }
  }

  /**
   * Check if browser notifications are supported
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get current notification permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported) {
      return 'denied';
    }
    return Notification.permission as NotificationPermission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission as NotificationPermission;
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show a notification for a high-priority article
   */
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return;
    }

    // Check permission
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Respect system do-not-disturb settings
    // The browser will automatically handle this, but we can check visibility
    if (document.hidden === false) {
      // User is actively viewing the page, don't show notification
      // They can already see the content
      return;
    }

    try {
      const notification = new Notification('🎃 Haunted RSS Reader', {
        body: `${data.title}\n\n${this.truncateSummary(data.summary)}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.articleId, // Prevents duplicate notifications for same article
        requireInteraction: false,
        silent: false,
        data: {
          articleId: data.articleId,
          url: `/article/${data.articleId}`,
        },
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to article
        const articleUrl = `/article/${data.articleId}`;
        window.location.href = articleUrl;

        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      console.log(`🔔 Notification shown for article: ${data.title}`);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show multiple notifications (with rate limiting)
   */
  async showNotifications(notifications: NotificationData[]): Promise<void> {
    if (notifications.length === 0) {
      return;
    }

    // Rate limit: show max 3 notifications at once
    const maxNotifications = 3;
    const notificationsToShow = notifications.slice(0, maxNotifications);

    for (const notification of notificationsToShow) {
      await this.showNotification(notification);
      // Add small delay between notifications
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // If there are more notifications, show a summary
    if (notifications.length > maxNotifications) {
      const remaining = notifications.length - maxNotifications;
      await this.showSummaryNotification(remaining);
    }
  }

  /**
   * Show a summary notification for multiple articles
   */
  private async showSummaryNotification(count: number): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification('🎃 Haunted RSS Reader', {
        body: `You have ${count} more high-priority articles waiting`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'summary',
        requireInteraction: false,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        window.location.href = '/';
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 10000);
    } catch (error) {
      console.error('Error showing summary notification:', error);
    }
  }

  /**
   * Truncate summary to fit in notification
   */
  private truncateSummary(summary: string, maxLength: number = 150): string {
    if (summary.length <= maxLength) {
      return summary;
    }
    return summary.substring(0, maxLength - 3) + '...';
  }

  /**
   * Check if notifications should be shown based on system settings
   */
  shouldShowNotifications(): boolean {
    if (!this.isSupported) {
      return false;
    }

    if (this.permission !== 'granted') {
      return false;
    }

    // Don't show notifications if user is actively viewing the page
    if (document.hidden === false) {
      return false;
    }

    return true;
  }

  /**
   * Test notification (for settings page)
   */
  async showTestNotification(): Promise<void> {
    const testData: NotificationData = {
      id: 'test',
      articleId: 'test',
      title: 'Test Notification',
      summary:
        'This is a test notification from Haunted RSS Reader. If you can see this, notifications are working! 👻',
      relevanceScore: 1.0,
      createdAt: new Date(),
    };

    // Force show even if page is visible (for testing)
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show test notification: permission not granted');
      return;
    }

    try {
      const notification = new Notification('🎃 Test Notification', {
        body: testData.summary,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test',
      });

      notification.onclick = () => {
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
