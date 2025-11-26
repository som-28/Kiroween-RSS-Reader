import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBellProps {
  className?: string;
}

/**
 * Notification bell component that shows pending notification count
 * and allows users to manage notification permissions
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { permission, isSupported, pendingCount, requestPermission, clearAllNotifications } =
    useNotifications();

  const handleClick = async () => {
    if (permission === 'default') {
      await requestPermission();
    } else if (permission === 'granted' && pendingCount > 0) {
      // Clear notifications when clicked
      await clearAllNotifications();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-lg transition-colors ${className}`}
      title={
        permission === 'default'
          ? 'Enable notifications'
          : permission === 'denied'
            ? 'Notifications blocked'
            : pendingCount > 0
              ? `${pendingCount} new notification${pendingCount > 1 ? 's' : ''}`
              : 'No new notifications'
      }
    >
      {/* Bell icon (bat for Halloween theme) */}
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Notification badge */}
      {permission === 'granted' && pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blood-red text-ghost-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}

      {/* Permission indicator */}
      {permission === 'default' && (
        <span className="absolute -top-1 -right-1 bg-pumpkin-orange w-3 h-3 rounded-full animate-pulse" />
      )}
    </button>
  );
};
