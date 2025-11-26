import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArticleList, ArticleFilters } from '../components/articles';
import type { ArticleFilterState } from '../components/articles/ArticleFilters';

export default function Articles() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'favorites'>('all');
  const [advancedFilters, setAdvancedFilters] = useState<ArticleFilterState>({
    feedIds: [],
    topics: [],
    sortBy: 'date', // Changed from 'relevance' to 'date' - newest first
  });

  return (
    <div className="space-y-8">
      {/* Modern header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-ghost">
            Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pumpkin to-blood-red">
              Articles
            </span>
          </h2>
          <p className="text-fog/70 text-lg">Discover and explore your curated content</p>
        </div>

        {/* Modern filter pills */}
        <div className="flex items-center gap-2 bg-graveyard/50 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-1.5 shadow-2xl">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-pumpkin/30 to-pumpkin/20 text-pumpkin shadow-lg shadow-pumpkin/20'
                : 'text-fog/60 hover:text-fog hover:bg-graveyard/50'
            }`}
          >
            All Articles
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('unread')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-poison-green/30 to-poison-green/20 text-poison-green shadow-lg shadow-poison-green/20'
                : 'text-fog/60 hover:text-fog hover:bg-graveyard/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-poison-green rounded-full animate-pulse" />
              Unread
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('favorites')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              filter === 'favorites'
                ? 'bg-gradient-to-r from-blood-red/30 to-blood-red/20 text-blood-red shadow-lg shadow-blood-red/20'
                : 'text-fog/60 hover:text-fog hover:bg-graveyard/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              Favorites
            </span>
          </motion.button>
        </div>
      </div>

      {/* Advanced Filters */}
      <ArticleFilters filters={advancedFilters} onFiltersChange={setAdvancedFilters} />

      {/* Article list */}
      <ArticleList
        isRead={filter === 'unread' ? false : undefined}
        isFavorite={filter === 'favorites' ? true : undefined}
        sortBy={advancedFilters.sortBy}
        topics={advancedFilters.topics.length > 0 ? advancedFilters.topics : undefined}
        startDate={advancedFilters.startDate}
        endDate={advancedFilters.endDate}
      />
    </div>
  );
}
