import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddFeedFormProps {
  onSubmit: (url: string, title?: string, description?: string) => Promise<void>;
  isLoading: boolean;
}

export default function AddFeedForm({ onSubmit, isLoading }: AddFeedFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url.trim()) {
      setError('Please enter a feed URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      await onSubmit(url.trim(), title.trim() || undefined, description.trim() || undefined);

      setUrl('');
      setTitle('');
      setDescription('');
      setShowAdvanced(false);
      setSuccess('Feed added successfully!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add feed');
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pumpkin/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-pumpkin to-blood-red rounded-2xl">
            <svg
              className="w-6 h-6 text-ghost"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-ghost">Add New Feed</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URL Input */}
          <div>
            <label htmlFor="feed-url" className="block text-sm font-medium text-fog/80 mb-2">
              Feed URL <span className="text-blood-red">*</span>
            </label>
            <input
              id="feed-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              disabled={isLoading}
              className="w-full bg-haunted-black/50 backdrop-blur-sm border border-pumpkin/30 rounded-xl px-4 py-3 text-ghost placeholder-fog/40 focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            />
          </div>

          {/* Advanced options toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-pumpkin hover:text-pumpkin/80 transition-colors"
          >
            <motion.svg
              className="w-4 h-4"
              animate={{ rotate: showAdvanced ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
            <span className="font-medium">Advanced Options</span>
          </button>

          {/* Advanced fields */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 overflow-hidden"
              >
                <div>
                  <label
                    htmlFor="feed-title"
                    className="block text-sm font-medium text-fog/80 mb-2"
                  >
                    Custom Title (optional)
                  </label>
                  <input
                    id="feed-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Leave empty to auto-detect"
                    disabled={isLoading}
                    className="w-full bg-haunted-black/50 backdrop-blur-sm border border-pumpkin/30 rounded-xl px-4 py-3 text-ghost placeholder-fog/40 focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feed-description"
                    className="block text-sm font-medium text-fog/80 mb-2"
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="feed-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this feed"
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-haunted-black/50 backdrop-blur-sm border border-pumpkin/30 rounded-xl px-4 py-3 text-ghost placeholder-fog/40 focus:border-pumpkin focus:outline-none focus:ring-2 focus:ring-pumpkin/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blood-red/10 border border-blood-red/30 rounded-xl p-4"
              >
                <div className="flex items-start gap-3 text-sm text-blood-red">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex-1">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-poison-green/10 border border-poison-green/30 rounded-xl p-4"
              >
                <div className="flex items-start gap-3 text-sm text-poison-green">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex-1">{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : undefined}
            whileTap={!isLoading ? { scale: 0.98 } : undefined}
            className="w-full px-6 py-4 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-2xl shadow-2xl shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <motion.svg
                  className="w-5 h-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </motion.svg>
                <span>Adding Feed...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add Feed</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
