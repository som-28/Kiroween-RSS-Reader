import React from 'react';
import { NotificationBell, NotificationSettings } from '../components';
import { useNotifications } from '../hooks';

/**
 * Example component demonstrating notification system integration
 *
 * This shows how to:
 * 1. Display notification bell with badge
 * 2. Show notification settings panel
 * 3. Handle notification permissions
 * 4. Display pending notifications
 */
export const NotificationExample: React.FC = () => {
  const {
    permission,
    isSupported,
    pendingCount,
    pendingNotifications,
    requestPermission,
    dismissNotification,
    clearAllNotifications,
  } = useNotifications();

  if (!isSupported) {
    return (
      <div className="p-8 bg-haunted-black min-h-screen text-ghost-white">
        <h1 className="text-3xl font-bold mb-4">Notification System</h1>
        <p className="text-blood-red">
          ⚠️ Browser notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-haunted-black min-h-screen text-ghost-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Notification Bell */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-pumpkin-orange">🎃 Notification System Demo</h1>
          <NotificationBell className="bg-graveyard-gray hover:bg-witch-purple" />
        </div>

        {/* Permission Status */}
        <div className="p-6 bg-graveyard-gray rounded-lg">
          <h2 className="text-xl font-bold mb-4">Permission Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Browser Support:</strong>{' '}
              <span className={isSupported ? 'text-poison-green' : 'text-blood-red'}>
                {isSupported ? '✓ Supported' : '✗ Not Supported'}
              </span>
            </p>
            <p>
              <strong>Permission:</strong>{' '}
              <span
                className={
                  permission === 'granted'
                    ? 'text-poison-green'
                    : permission === 'denied'
                      ? 'text-blood-red'
                      : 'text-pumpkin-orange'
                }
              >
                {permission === 'granted'
                  ? '✓ Granted'
                  : permission === 'denied'
                    ? '✗ Denied'
                    : '? Not Set'}
              </span>
            </p>
            <p>
              <strong>Pending Notifications:</strong>{' '}
              <span className="text-pumpkin-orange">{pendingCount}</span>
            </p>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="mt-4 px-6 py-2 bg-pumpkin-orange text-haunted-black rounded-lg hover:bg-opacity-80 transition-colors font-medium"
            >
              Request Permission
            </button>
          )}
        </div>

        {/* Pending Notifications List */}
        {pendingNotifications.length > 0 && (
          <div className="p-6 bg-graveyard-gray rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pending Notifications</h2>
              <button
                onClick={clearAllNotifications}
                className="px-4 py-2 bg-blood-red text-ghost-white rounded-lg hover:bg-opacity-80 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {pendingNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 bg-haunted-black rounded-lg border border-witch-purple"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-pumpkin-orange mb-2">{notification.title}</h3>
                      <p className="text-sm text-ghost-white mb-2">{notification.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-fog-gray">
                        <span>Relevance: {(notification.relevanceScore * 100).toFixed(0)}%</span>
                        <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotification(notification.articleId)}
                      className="px-3 py-1 bg-graveyard-gray hover:bg-witch-purple rounded text-sm transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Usage Instructions */}
        <div className="p-6 bg-graveyard-gray rounded-lg">
          <h2 className="text-xl font-bold mb-4">How to Use</h2>
          <ol className="space-y-2 list-decimal list-inside text-ghost-white">
            <li>Enable notification permissions using the button above</li>
            <li>Configure your notification preferences (threshold, enable/disable)</li>
            <li>Add RSS feeds and set your interests in preferences</li>
            <li>When high-priority articles are found, you'll receive notifications</li>
            <li>Click notifications to navigate to the article</li>
            <li>Notifications respect system do-not-disturb settings</li>
          </ol>
        </div>

        {/* Integration Code Example */}
        <div className="p-6 bg-graveyard-gray rounded-lg">
          <h2 className="text-xl font-bold mb-4">Integration Example</h2>
          <pre className="bg-haunted-black p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-poison-green">{`import { NotificationBell, NotificationSettings } from './components';
import { useNotifications } from './hooks';

function App() {
  const { pendingCount, requestPermission } = useNotifications();
  
  return (
    <div>
      {/* Add notification bell to header */}
      <NotificationBell />
      
      {/* Add settings to preferences page */}
      <NotificationSettings />
    </div>
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
