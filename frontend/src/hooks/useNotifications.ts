import { useState, useEffect, useCallback } from 'react';
import {
  notificationService,
  NotificationData,
  NotificationPermission,
} from '../services/notificationService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  pendingCount: number;
  pendingNotifications: NotificationData[];
  requestPermission: () => Promise<NotificationPermission>;
  checkNotifications: () => Promise<void>;
  dismissNotification: (articleId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  showTestNotification: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing browser notifications
 */
export function useNotifications(pollInterval: number = 60000): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [isSupported] = useState(notificationService.isNotificationSupported());
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingNotifications, setPendingNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (err) {
      console.error('Error requesting permission:', err);
      return 'denied';
    }
  }, []);

  /**
   * Fetch pending notifications from backend
   */
  const fetchPendingNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();

      setPendingNotifications(data.notifications || []);
      setPendingCount(data.count || 0);

      return data.notifications || [];
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      return [];
    }
  }, []);

  /**
   * Check for new notifications and show them
   */
  const checkNotifications = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const notifications = await fetchPendingNotifications();

      // Show browser notifications for new items
      if (notifications.length > 0 && notificationService.shouldShowNotifications()) {
        await notificationService.showNotifications(notifications);
      }
    } catch (err: any) {
      console.error('Error checking notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, fetchPendingNotifications]);

  /**
   * Dismiss a specific notification
   */
  const dismissNotification = useCallback(async (articleId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss notification');
      }

      // Update local state
      setPendingNotifications((prev) => prev.filter((n) => n.articleId !== articleId));
      setPendingCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error dismissing notification:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }

      setPendingNotifications([]);
      setPendingCount(0);
    } catch (err: any) {
      console.error('Error clearing notifications:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Show test notification
   */
  const showTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      await requestPermission();
    }
    await notificationService.showTestNotification();
  }, [permission, requestPermission]);

  /**
   * Poll for new notifications
   */
  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    // Initial check
    checkNotifications();

    // Set up polling
    const intervalId = setInterval(() => {
      checkNotifications();
    }, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isSupported, permission, pollInterval, checkNotifications]);

  /**
   * Listen for visibility changes to check notifications when user returns
   */
  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the page, refresh notifications
        fetchPendingNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, permission, fetchPendingNotifications]);

  return {
    permission,
    isSupported,
    pendingCount,
    pendingNotifications,
    requestPermission,
    checkNotifications,
    dismissNotification,
    clearAllNotifications,
    showTestNotification,
    isLoading,
    error,
  };
}
