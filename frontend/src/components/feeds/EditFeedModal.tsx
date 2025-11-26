import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Feed } from '../../services/feedService';

interface EditFeedModalProps {
  feed: Feed | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: {
      title?: string;
      description?: string;
      fetchInterval?: number;
      status?: 'active' | 'error' | 'paused';
    }
  ) => Promise<void>;
  isSaving: boolean;
}

export default function EditFeedModal({
  feed,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditFeedModalProps) {
  const { enableAnimations } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fetchInterval, setFetchInterval] = useState(60);
  const [status, setStatus] = useState<'active' | 'error' | 'paused'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (feed) {
      setTitle(feed.title);
      setDescription(feed.description || '');
      setFetchInterval(feed.fetchInterval);
      setStatus(feed.status);
    }
  }, [feed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!feed) return;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (fetchInterval < 5) {
      setError('Fetch interval must be at least 5 minutes');
      return;
    }

    try {
      await onSave(feed.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        fetchInterval,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update feed');
    }
  };

  if (!feed) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={enableAnimations ? { opacity: 0 } : undefined}
            animate={enableAnimations ? { opacity: 1 } : undefined}
            exit={enableAnimations ? { opacity: 0 } : undefined}
            onClick={onClose}
            className="fixed inset-0 bg-haunted-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={enableAnimations ? { opacity: 0, scale: 0.9, y: 20 } : undefined}
              animate={enableAnimations ? { opacity: 1, scale: 1, y: 0 } : undefined}
              exit={enableAnimations ? { opacity: 0, scale: 0.9, y: 20 } : undefined}
              className="bg-haunted-gray border-2 border-pumpkin/50 rounded-lg p-6 
                       max-w-lg w-full shadow-2xl shadow-pumpkin/20 my-8"
            >
              {/* Title */}
              <h3 className="text-2xl font-creepy text-pumpkin mb-4 flex items-center gap-2">
                <span>✏️</span>
                Edit Feed Settings
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-semibold text-fog mb-2">
                    Title <span className="text-blood">*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-haunted-black border-2 border-pumpkin/30 rounded px-4 py-2
                             text-haunted-white placeholder-fog/50
                             focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-semibold text-fog mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSaving}
                    rows={3}
                    className="w-full bg-haunted-black border-2 border-pumpkin/30 rounded px-4 py-2
                             text-haunted-white placeholder-fog/50
                             focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors resize-none"
                  />
                </div>

                {/* Fetch Interval */}
                <div>
                  <label
                    htmlFor="edit-interval"
                    className="block text-sm font-semibold text-fog mb-2"
                  >
                    Fetch Interval (minutes)
                  </label>
                  <input
                    id="edit-interval"
                    type="number"
                    min="5"
                    value={fetchInterval}
                    onChange={(e) => setFetchInterval(parseInt(e.target.value) || 60)}
                    disabled={isSaving}
                    className="w-full bg-haunted-black border-2 border-pumpkin/30 rounded px-4 py-2
                             text-haunted-white placeholder-fog/50
                             focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                  />
                  <p className="text-xs text-fog/60 mt-1">
                    How often to check for new articles (minimum 5 minutes)
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="edit-status"
                    className="block text-sm font-semibold text-fog mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'error' | 'paused')}
                    disabled={isSaving}
                    className="w-full bg-haunted-black border-2 border-pumpkin/30 rounded px-4 py-2
                             text-haunted-white
                             focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                  >
                    <option value="active">👻 Active</option>
                    <option value="paused">😴 Paused</option>
                    <option value="error">💀 Error</option>
                  </select>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={enableAnimations ? { opacity: 0, y: -10 } : undefined}
                      animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
                      exit={enableAnimations ? { opacity: 0, y: -10 } : undefined}
                      className="bg-blood/20 border-2 border-blood/50 rounded p-3 text-blood text-sm
                               flex items-start gap-2"
                    >
                      <span className="text-lg">⚠️</span>
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={enableAnimations && !isSaving ? { scale: 1.02 } : undefined}
                    whileTap={enableAnimations && !isSaving ? { scale: 0.98 } : undefined}
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 bg-haunted-black hover:bg-haunted-gray border-2 border-fog/30
                             text-fog font-semibold py-2 rounded transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={enableAnimations && !isSaving ? { scale: 1.02 } : undefined}
                    whileTap={enableAnimations && !isSaving ? { scale: 0.98 } : undefined}
                    disabled={isSaving}
                    className="flex-1 bg-pumpkin hover:bg-pumpkin-light text-haunted-black 
                             font-bold py-2 rounded transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin">🔮</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
