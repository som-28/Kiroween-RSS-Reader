import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SearchFilters as Filters } from '../../services/searchService';
import type { Feed } from '../../types/models';

interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  feeds: Feed[];
  availableTopics: string[];
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  feeds,
  availableTopics,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFeedToggle = (feedId: string) => {
    const currentFeedIds = filters.feedIds || [];
    const newFeedIds = currentFeedIds.includes(feedId)
      ? currentFeedIds.filter((id) => id !== feedId)
      : [...currentFeedIds, feedId];

    onFiltersChange({
      ...filters,
      feedIds: newFeedIds.length > 0 ? newFeedIds : undefined,
    });
  };

  const handleTopicToggle = (topic: string) => {
    const currentTopics = filters.topics || [];
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter((t) => t !== topic)
      : [...currentTopics, topic];

    onFiltersChange({
      ...filters,
      topics: newTopics.length > 0 ? newTopics : undefined,
    });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : undefined;
    onFiltersChange({
      ...filters,
      [type === 'start' ? 'startDate' : 'endDate']: date,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount =
    (filters.feedIds?.length || 0) +
    (filters.topics?.length || 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Filter toggle button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-graveyard/60 to-haunted-black/60 backdrop-blur-sm border border-pumpkin/30 rounded-xl hover:border-pumpkin/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-pumpkin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-ghost font-semibold">Spell Ingredients</span>
          {activeFilterCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 bg-pumpkin text-haunted-black text-xs font-bold rounded-full"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </div>
        <motion.svg
          className="w-5 h-5 text-fog"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Filters panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-haunted-black/80 via-graveyard/60 to-haunted-black/80 backdrop-blur-xl border border-pumpkin/20 rounded-xl p-6 space-y-6">
              {/* Feed sources filter */}
              {feeds.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-fog uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-witch-purple"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Feed Sources
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {feeds.map((feed) => (
                      <motion.label
                        key={feed.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-2 hover:bg-graveyard/40 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.feedIds?.includes(feed.id) || false}
                          onChange={() => handleFeedToggle(feed.id)}
                          className="w-4 h-4 rounded border-pumpkin/50 bg-graveyard text-pumpkin focus:ring-pumpkin focus:ring-offset-0"
                        />
                        <span className="text-ghost text-sm flex-1">{feed.title}</span>
                        <span className="text-xs text-fog/60">{feed.articleCount}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics filter */}
              {availableTopics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-fog uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-poison-green"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.slice(0, 20).map((topic) => {
                      const isSelected = filters.topics?.includes(topic) || false;
                      return (
                        <motion.button
                          key={topic}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTopicToggle(topic)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            isSelected
                              ? 'bg-poison-green/30 text-poison-green border border-poison-green/50 shadow-lg shadow-poison-green/20'
                              : 'bg-graveyard/40 text-fog border border-pumpkin/20 hover:border-pumpkin/40'
                          }`}
                        >
                          {topic}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date range filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-fog uppercase tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4 text-pumpkin" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Date Range
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-fog/70 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full px-3 py-2 bg-graveyard/60 border border-pumpkin/30 rounded-lg text-ghost focus:border-pumpkin focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-fog/70 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full px-3 py-2 bg-graveyard/60 border border-pumpkin/30 rounded-lg text-ghost focus:border-pumpkin focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Clear filters button */}
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 bg-blood-red/20 hover:bg-blood-red/30 border border-blood-red/40 rounded-lg text-blood-red font-medium transition-all duration-300"
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
