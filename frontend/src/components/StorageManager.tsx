import React, { useEffect, useState } from 'react';
import { cacheManager, StorageInfo } from '../services/cacheManager';
import { CachedArticle } from '../services/db';

export const StorageManager: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [offlineArticles, setOfflineArticles] = useState<CachedArticle[]>([]);
  const [evictableCount, setEvictableCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const loadStorageInfo = async () => {
    try {
      const info = await cacheManager.getStorageInfo();
      const offline = await cacheManager.getOfflineArticles();
      const evictable = await cacheManager.getEvictableArticles();

      setStorageInfo(info);
      setOfflineArticles(offline);
      setEvictableCount(evictable.length);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStorageInfo();

    // Refresh every 10 seconds
    const interval = setInterval(loadStorageInfo, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await cacheManager.clearAllCache();
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearExceptOffline = async () => {
    if (!confirm('Clear all cached data except articles marked for offline?')) {
      return;
    }

    setIsClearing(true);
    try {
      await cacheManager.clearCacheExceptOffline();
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handlePerformEviction = async () => {
    setIsClearing(true);
    try {
      const evicted = await cacheManager.performEviction();
      alert(`Evicted ${evicted} articles from cache`);
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to perform eviction:', error);
      alert('Failed to evict articles. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleToggleOffline = async (articleId: string, currentState: boolean) => {
    try {
      if (currentState) {
        await cacheManager.unmarkForOffline(articleId);
      } else {
        await cacheManager.markForOffline(articleId);
      }
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to toggle offline status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pumpkin-orange border-t-transparent"></div>
        <p className="mt-2 text-ghost-white">Loading storage information...</p>
      </div>
    );
  }

  if (!storageInfo) {
    return <div className="p-6 text-center text-blood-red">Failed to load storage information</div>;
  }

  const usedPercentage = storageInfo.usedPercentage;
  const formattedUsed = cacheManager.formatBytes(storageInfo.used);
  const formattedQuota = cacheManager.formatBytes(storageInfo.quota);

  return (
    <div className="p-6 bg-graveyard-gray rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-pumpkin-orange mb-6">Storage Management</h2>

      {/* Storage Usage Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-ghost-white mb-2">
          <span>Storage Used</span>
          <span>
            {formattedUsed} / {formattedQuota} ({usedPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-haunted-black rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              usedPercentage > 90
                ? 'bg-blood-red'
                : usedPercentage > 70
                  ? 'bg-pumpkin-orange'
                  : 'bg-poison-green'
            }`}
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-haunted-black p-4 rounded">
          <div className="text-ghost-white text-sm">Total Articles</div>
          <div className="text-2xl font-bold text-pumpkin-orange">{storageInfo.articleCount}</div>
        </div>
        <div className="bg-haunted-black p-4 rounded">
          <div className="text-ghost-white text-sm">Offline Articles</div>
          <div className="text-2xl font-bold text-poison-green">
            {storageInfo.offlineArticleCount}
          </div>
        </div>
        <div className="bg-haunted-black p-4 rounded">
          <div className="text-ghost-white text-sm">Evictable Articles</div>
          <div className="text-2xl font-bold text-witch-purple">{evictableCount}</div>
        </div>
        <div className="bg-haunted-black p-4 rounded">
          <div className="text-ghost-white text-sm">Storage Status</div>
          <div
            className={`text-lg font-bold ${
              usedPercentage > 90
                ? 'text-blood-red'
                : usedPercentage > 70
                  ? 'text-pumpkin-orange'
                  : 'text-poison-green'
            }`}
          >
            {usedPercentage > 90 ? 'Critical' : usedPercentage > 70 ? 'High' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handlePerformEviction}
          disabled={isClearing || evictableCount === 0}
          className="w-full bg-witch-purple hover:bg-opacity-80 text-ghost-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isClearing ? 'Processing...' : `Evict ${evictableCount} Old Articles`}
        </button>

        <button
          onClick={handleClearExceptOffline}
          disabled={isClearing}
          className="w-full bg-pumpkin-orange hover:bg-opacity-80 text-ghost-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isClearing ? 'Processing...' : 'Clear Cache (Keep Offline)'}
        </button>

        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className="w-full bg-blood-red hover:bg-opacity-80 text-ghost-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isClearing ? 'Processing...' : 'Clear All Cache'}
        </button>
      </div>

      {/* Offline Articles List */}
      {offlineArticles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-ghost-white mb-3">
            Articles Marked for Offline ({offlineArticles.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {offlineArticles.map((article) => (
              <div
                key={article.id}
                className="bg-haunted-black p-3 rounded flex justify-between items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-ghost-white font-medium truncate">{article.title}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleOffline(article.id, true)}
                  className="ml-3 text-blood-red hover:text-opacity-80 transition-colors"
                  title="Remove from offline"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
