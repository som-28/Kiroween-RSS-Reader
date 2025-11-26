import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedService } from '../../services/feedService';
import type { Feed } from '../../types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ArticleFilterState {
  feedIds: string[];
  topics: string[];
  startDate?: Date;
  endDate?: Date;
  sortBy: 'relevance' | 'date' | 'title';
}

interface ArticleFiltersProps {
  filters: ArticleFilterState;
  onFiltersChange: (filters: ArticleFilterState) => void;
}

export default function ArticleFilters({ filters, onFiltersChange }: ArticleFiltersProps) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [topicInput, setTopicInput] = useState('');

  useEffect(() => {
    loadFeeds();
    loadAvailableTopics();
  }, []);

  const loadFeeds = async () => {
    try {
      const data = await feedService.getFeeds();
      setFeeds(data);
    } catch (err) {
      console.error('Failed to load feeds:', err);
    }
  };

  const loadAvailableTopics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/topics`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTopics(data.topics || []);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
  };

  const handleFeedToggle = (feedId: string) => {
    const newFeedIds = filters.feedIds.includes(feedId)
      ? filters.feedIds.filter((id) => id !== feedId)
      : [...filters.feedIds, feedId];
    onFiltersChange({ ...filters, feedIds: newFeedIds });
  };

  const handleTopicAdd = (topic: string) => {
    if (topic && !filters.topics.includes(topic)) {
      onFiltersChange({ ...filters, topics: [...filters.topics, topic] });
    }
    setTopicInput('');
  };

  const handleTopicRemove = (topic: string) => {
    onFiltersChange({ ...filters, topics: filters.topics.filter((t) => t !== topic) });
  };

  const handleSortChange = (sortBy: 'relevance' | 'date' | 'title') => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      onFiltersChange({ ...filters, startDate: value ? new Date(value) : undefined });
    } else {
      onFiltersChange({ ...filters, endDate: value ? new Date(value) : undefined });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      feedIds: [],
      topics: [],
      startDate: undefined,
      endDate: undefined,
      sortBy: 'relevance',
    });
  };

  const activeFilterCount =
    filters.feedIds.length +
    filters.topics.length +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter Toggle Button - Styled as Spell Book */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-br from-witch-purple/20 via-witch-purple/10 to-transparent backdrop-blur-xl border border-witch-purple/30 rounded-2xl p-6 shadow-2xl shadow-witch-purple/10 hover:shadow-witch-purple/20 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl"
            >
              📖
            </motion.div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-witch-purple">Spell Ingredients</h3>
              <p className="text-fog/60 text-sm">Filter and sort your mystical articles</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-pumpkin/20 border border-pumpkin/40 rounded-full text-pumpkin text-sm font-medium"
              >
                {activeFilterCount} active
              </motion.div>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-witch-purple"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.button>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-graveyard/80 via-haunted-black/60 to-graveyard/80 backdrop-blur-xl border border-witch-purple/20 rounded-2xl p-8 space-y-8 shadow-2xl">
              {/* Sort Options - Styled as Potion Bottles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-poison-green">
                  <span className="text-2xl">🧪</span>
                  <h4 className="text-lg font-bold">Sort Potion</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['relevance', 'date', 'title'] as const).map((sort) => (
                    <motion.button
                      key={sort}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSortChange(sort)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        filters.sortBy === sort
                          ? 'bg-gradient-to-br from-poison-green/30 to-poison-green/20 border-2 border-poison-green/50 text-poison-green shadow-lg shadow-poison-green/20'
                          : 'bg-graveyard/50 border border-fog/20 text-fog/60 hover:text-fog hover:border-poison-green/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">
                          {sort === 'relevance' ? '⭐' : sort === 'date' ? '📅' : '🔤'}
                        </span>
                        <span className="text-sm capitalize">{sort}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Feed Source Filter - Styled as Cauldron Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-pumpkin">
                  <span className="text-2xl">🍄</span>
                  <h4 className="text-lg font-bold">Feed Sources</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {feeds.map((feed) => (
                    <motion.button
                      key={feed.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFeedToggle(feed.id)}
                      className={`px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                        filters.feedIds.includes(feed.id)
                          ? 'bg-gradient-to-br from-pumpkin/30 to-pumpkin/20 border-2 border-pumpkin/50 text-pumpkin shadow-lg shadow-pumpkin/20'
                          : 'bg-graveyard/50 border border-fog/20 text-fog/70 hover:text-fog hover:border-pumpkin/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            filters.feedIds.includes(feed.id) ? 'bg-pumpkin' : 'bg-fog/30'
                          }`}
                        />
                        <span className="text-sm font-medium truncate">{feed.title}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Topic Filter - Styled as Spell Tags */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-witch-purple">
                  <span className="text-2xl">🏷️</span>
                  <h4 className="text-lg font-bold">Topic Spells</h4>
                </div>

                {/* Topic Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTopicAdd(topicInput);
                      }
                    }}
                    placeholder="Add a topic..."
                    className="flex-1 px-4 py-3 bg-haunted-black/50 border border-witch-purple/30 rounded-xl text-ghost placeholder-fog/40 focus:outline-none focus:border-witch-purple/60 focus:ring-2 focus:ring-witch-purple/20 transition-all"
                    list="topic-suggestions"
                  />
                  <datalist id="topic-suggestions">
                    {availableTopics.map((topic) => (
                      <option key={topic} value={topic} />
                    ))}
                  </datalist>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTopicAdd(topicInput)}
                    className="px-6 py-3 bg-gradient-to-r from-witch-purple/30 to-witch-purple/20 border border-witch-purple/50 text-witch-purple rounded-xl font-medium hover:from-witch-purple/40 hover:to-witch-purple/30 transition-all"
                  >
                    Add
                  </motion.button>
                </div>

                {/* Selected Topics */}
                {filters.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.topics.map((topic) => (
                      <motion.div
                        key={topic}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-4 py-2 bg-gradient-to-r from-witch-purple/30 to-witch-purple/20 border border-witch-purple/50 rounded-full text-witch-purple text-sm font-medium flex items-center gap-2 shadow-lg shadow-witch-purple/10"
                      >
                        <span>{topic}</span>
                        <button
                          onClick={() => handleTopicRemove(topic)}
                          className="hover:text-blood-red transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Filter - Styled as Time Crystals */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blood-red">
                  <span className="text-2xl">🔮</span>
                  <h4 className="text-lg font-bold">Time Crystals</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-fog/70 font-medium">From Date</label>
                    <input
                      type="date"
                      value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full px-4 py-3 bg-haunted-black/50 border border-blood-red/30 rounded-xl text-ghost focus:outline-none focus:border-blood-red/60 focus:ring-2 focus:ring-blood-red/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-fog/70 font-medium">To Date</label>
                    <input
                      type="date"
                      value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full px-4 py-3 bg-haunted-black/50 border border-blood-red/30 rounded-xl text-ghost focus:outline-none focus:border-blood-red/60 focus:ring-2 focus:ring-blood-red/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllFilters}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blood-red/20 to-blood-red/10 border border-blood-red/40 text-blood-red rounded-xl font-medium hover:from-blood-red/30 hover:to-blood-red/20 transition-all shadow-lg shadow-blood-red/10"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🧹</span>
                    <span>Clear All Spells</span>
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(26, 26, 26, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(106, 13, 173, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(106, 13, 173, 0.7);
        }
      `}</style>
    </div>
  );
}
