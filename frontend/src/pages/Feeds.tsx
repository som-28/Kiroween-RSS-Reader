import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feedService, Feed } from '../services/feedService';
import AddFeedForm from '../components/feeds/AddFeedForm';
import FeedList from '../components/feeds/FeedList';
import DeleteFeedModal from '../components/feeds/DeleteFeedModal';
import EditFeedModal from '../components/feeds/EditFeedModal';
import { pageTransition } from '../router';

export default function Feeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [refreshingFeedId, setRefreshingFeedId] = useState<string | undefined>();
  const [deletingFeed, setDeletingFeed] = useState<Feed | null>(null);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load feeds on mount
  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedFeeds = await feedService.getFeeds();
      setFeeds(fetchedFeeds);
    } catch (err: any) {
      console.error('Failed to load feeds:', err);
      setError('Failed to load feeds from the beyond...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeed = async (url: string, title?: string, description?: string) => {
    setIsAddingFeed(true);
    try {
      const newFeed = await feedService.createFeed({ url, title, description });
      setFeeds([...feeds, newFeed]);
    } finally {
      setIsAddingFeed(false);
    }
  };

  const handleRefreshFeed = async (id: string) => {
    setRefreshingFeedId(id);
    try {
      const result = await feedService.refreshFeed(id);
      setFeeds(feeds.map((f) => (f.id === id ? result.feed : f)));
    } catch (err) {
      console.error('Failed to refresh feed:', err);
    } finally {
      setRefreshingFeedId(undefined);
    }
  };

  const handleDeleteFeed = async () => {
    if (!deletingFeed) return;

    setIsDeleting(true);
    try {
      await feedService.deleteFeed(deletingFeed.id);
      setFeeds(feeds.filter((f) => f.id !== deletingFeed.id));
      setDeletingFeed(null);
    } catch (err) {
      console.error('Failed to delete feed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditFeed = async (
    id: string,
    updates: {
      title?: string;
      description?: string;
      fetchInterval?: number;
      status?: 'active' | 'error' | 'paused';
    }
  ) => {
    setIsSaving(true);
    try {
      const updatedFeed = await feedService.updateFeed(id, updates);
      setFeeds(feeds.map((f) => (f.id === id ? updatedFeed : f)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderFeeds = (reorderedFeeds: Feed[]) => {
    setFeeds(reorderedFeeds);
    // Could save order to backend/localStorage here
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="space-y-6"
    >
      {/* Modern Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-ghost">
            Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pumpkin to-blood-red">
              Feeds
            </span>
          </h2>
          <p className="text-fog/70 text-lg">Manage your RSS sources and discover new content</p>
        </div>
        {feeds.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pumpkin/20 to-pumpkin/10 backdrop-blur-sm border border-pumpkin/30 rounded-2xl">
            <svg className="w-5 h-5 text-pumpkin" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span className="text-ghost font-semibold">{feeds.length}</span>
            <span className="text-fog/70">Active Feeds</span>
          </div>
        )}
      </div>

      {/* Add Feed Form */}
      <AddFeedForm onSubmit={handleAddFeed} isLoading={isAddingFeed} />

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blood-red/20 to-blood-red/10 backdrop-blur-sm border border-blood-red/30 rounded-2xl p-6"
        >
          <p className="flex items-center gap-3 text-blood-red">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-7xl mb-6"
          >
            🎃
          </motion.div>
          <p className="text-fog/70 text-lg">Loading your feeds...</p>
        </div>
      ) : (
        /* Feed List */
        <FeedList
          feeds={feeds}
          onRefresh={handleRefreshFeed}
          onDelete={(id) => setDeletingFeed(feeds.find((f) => f.id === id) || null)}
          onEdit={(id) => setEditingFeed(feeds.find((f) => f.id === id) || null)}
          onReorder={handleReorderFeeds}
          refreshingFeedId={refreshingFeedId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteFeedModal
        feed={deletingFeed}
        isOpen={!!deletingFeed}
        onClose={() => setDeletingFeed(null)}
        onConfirm={handleDeleteFeed}
        isDeleting={isDeleting}
      />

      {/* Edit Feed Modal */}
      <EditFeedModal
        feed={editingFeed}
        isOpen={!!editingFeed}
        onClose={() => setEditingFeed(null)}
        onSave={handleEditFeed}
        isSaving={isSaving}
      />
    </motion.div>
  );
}
