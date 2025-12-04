import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface NotificationSettingsProps {
  className?: string;
}

/**
 * Component for managing notification settings
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const { permission, isSupported, requestPermission, showTestNotification } = useNotifications();

  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notificationThreshold, setNotificationThreshold] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/preferences`);
        if (response.ok) {
          const data = await response.json();
          setEnableNotifications(data.enableNotifications ?? true);
          setNotificationThreshold(data.notificationThreshold ?? 0.7);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableNotifications,
          notificationThreshold,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully! 👻' });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setMessage({ type: 'success', text: 'Notification permission granted! 🎃' });
    } else if (result === 'denied') {
      setMessage({
        type: 'error',
        text: 'Notification permission denied. Please enable in browser settings.',
      });
    }
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      await handleRequestPermission();
      return;
    }
    await showTestNotification();
    setMessage({ type: 'success', text: 'Test notification sent! 👻' });
  };

  if (!isSupported) {
    return (
      <div className={`p-4 bg-graveyard-gray rounded-lg ${className}`}>
        <p className="text-ghost-white">
          ⚠️ Browser notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 bg-graveyard-gray rounded-lg ${className}`}>
        <p className="text-ghost-white">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-graveyard-gray rounded-lg space-y-6 ${className}`}>
      <h3 className="text-xl font-bold text-pumpkin-orange">🔔 Notification Settings</h3>

      {/* Browser Permission Status */}
      <div className="space-y-2">
        <label className="block text-ghost-white font-medium">Browser Permission</label>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              permission === 'granted'
                ? 'bg-poison-green text-haunted-black'
                : permission === 'denied'
                  ? 'bg-blood-red text-ghost-white'
                  : 'bg-fog-gray text-ghost-white'
            }`}
          >
            {permission === 'granted'
              ? '✓ Granted'
              : permission === 'denied'
                ? '✗ Denied'
                : '? Not Set'}
          </span>
          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-pumpkin-orange text-haunted-black rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Request Permission
            </button>
          )}
          {permission === 'granted' && (
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-witch-purple text-ghost-white rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Test Notification
            </button>
          )}
        </div>
      </div>

      {/* Enable/Disable Notifications */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enableNotifications}
            onChange={(e) => setEnableNotifications(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-pumpkin-orange bg-haunted-black checked:bg-pumpkin-orange"
          />
          <span className="text-ghost-white font-medium">
            Enable notifications for high-priority articles
          </span>
        </label>
        <p className="text-sm text-fog-gray ml-8">
          Get notified when articles matching your interests are found
        </p>
      </div>

      {/* Notification Threshold */}
      <div className="space-y-2">
        <label className="block text-ghost-white font-medium">
          Relevance Threshold: {(notificationThreshold * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={notificationThreshold}
          onChange={(e) => setNotificationThreshold(parseFloat(e.target.value))}
          disabled={!enableNotifications}
          className="w-full h-2 bg-graveyard-gray rounded-lg appearance-none cursor-pointer accent-pumpkin-orange"
        />
        <p className="text-sm text-fog-gray">
          Only notify for articles with relevance score above this threshold
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-pumpkin-orange text-haunted-black rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>

        {message && (
          <span
            className={`text-sm ${
              message.type === 'success' ? 'text-poison-green' : 'text-blood-red'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-haunted-black rounded-lg border border-witch-purple">
        <p className="text-sm text-ghost-white">
          <strong>ℹ️ How it works:</strong> When new articles are fetched that match your interests
          and exceed the relevance threshold, you'll receive a browser notification. Notifications
          respect your system's do-not-disturb settings and won't show if you're actively viewing
          the app.
        </p>
      </div>
    </div>
  );
};
