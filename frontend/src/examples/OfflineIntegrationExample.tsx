/**
 * Example: Complete Offline Support Integration
 *
 * This example shows how to integrate all offline support features
 * into your Haunted RSS Reader application.
 */

import React, { useEffect } from 'react';
import { OfflineIndicator, StorageManager, OfflineButton } from '../components';
import { useCacheSync, useOfflineArticles } from '../hooks';
import {
  initializeOfflineSupport,
  cleanupOfflineSupport,
  fetchArticles,
  updateArticle,
} from '../services/offlineIntegration';

// Main App Component with Offline Support
export function AppWithOfflineSupport() {
  useEffect(() => {
    // Initialize offline support when app starts
    initializeOfflineSupport();

    // Cleanup when app unmounts
    return () => {
      cleanupOfflineSupport();
    };
  }, []);

  return (
    <div className="min-h-screen bg-haunted-black">
      {/* Show offline indicator at the top */}
      <OfflineIndicator />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-pumpkin-orange mb-6">Haunted RSS Reader</h1>

        {/* Sync status component */}
        <SyncStatusBar />

        {/* Article list with offline support */}
        <ArticleListWithOffline />

        {/* Storage management in settings */}
        <div className="mt-8">
          <StorageManager />
        </div>
      </div>
    </div>
  );
}

// Sync Status Bar Component
function SyncStatusBar() {
  const { isOnline, isSyncing, pendingOperationsCount, manualSync } = useCacheSync();

  return (
    <div className="bg-graveyard-gray p-4 rounded-lg mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-poison-green' : 'bg-blood-red'}`} />
        <span className="text-ghost-white">{isOnline ? 'Online' : 'Offline'}</span>

        {pendingOperationsCount > 0 && (
          <span className="text-pumpkin-orange">{pendingOperationsCount} pending operations</span>
        )}
      </div>

      {isOnline && pendingOperationsCount > 0 && (
        <button
          onClick={manualSync}
          disabled={isSyncing}
          className="bg-witch-purple hover:bg-opacity-80 text-ghost-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}

// Article List with Offline Support
function ArticleListWithOffline() {
  const [articles, setArticles] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (articleId: string) => {
    try {
      await updateArticle(articleId, { isRead: true });
      // Update local state optimistically
      setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, isRead: true } : a)));
    } catch (error) {
      console.error('Failed to mark article as read:', error);
    }
  };

  if (isLoading) {
    return <div className="text-ghost-white">Loading articles...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-ghost-white mb-4">Articles</h2>

      {articles.map((article) => (
        <div key={article.id} className="bg-graveyard-gray p-4 rounded-lg">
          <h3 className="text-xl font-bold text-ghost-white mb-2">{article.title}</h3>

          <p className="text-gray-400 mb-4">{article.excerpt || article.summary}</p>

          <div className="flex items-center gap-3">
            {/* Offline button */}
            <OfflineButton articleId={article.id} />

            {/* Mark as read button */}
            {!article.isRead && (
              <button
                onClick={() => handleMarkAsRead(article.id)}
                className="bg-witch-purple hover:bg-opacity-80 text-ghost-white px-3 py-1.5 rounded text-sm"
              >
                Mark as Read
              </button>
            )}

            {article.isRead && <span className="text-poison-green text-sm">✓ Read</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Offline Articles Page
export function OfflineArticlesPage() {
  const { offlineArticles, isLoading, unmarkForOffline } = useOfflineArticles();

  if (isLoading) {
    return <div className="text-ghost-white">Loading offline articles...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-pumpkin-orange mb-6">Offline Articles</h1>

      {offlineArticles.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>No articles saved for offline reading</p>
          <p className="text-sm mt-2">
            Use the "Save Offline" button on articles to access them without internet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offlineArticles.map((article) => (
            <div key={article.id} className="bg-graveyard-gray p-4 rounded-lg">
              <h3 className="text-xl font-bold text-ghost-white mb-2">{article.title}</h3>

              <p className="text-gray-400 mb-4">{article.excerpt || article.summary}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Saved {new Date(article.cachedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => unmarkForOffline(article.id)}
                  className="text-blood-red hover:text-opacity-80 text-sm"
                >
                  Remove from Offline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Page with Storage Management
export function SettingsPageWithStorage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-pumpkin-orange mb-6">Settings</h1>

      {/* Other settings sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ghost-white mb-4">Preferences</h2>
        {/* Preference controls */}
      </div>

      {/* Storage management section */}
      <div>
        <h2 className="text-2xl font-bold text-ghost-white mb-4">Storage & Cache</h2>
        <StorageManager />
      </div>
    </div>
  );
}
