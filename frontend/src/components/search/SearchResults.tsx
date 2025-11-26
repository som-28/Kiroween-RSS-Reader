import { motion, AnimatePresence } from 'framer-motion';
import type { Article } from '../../types/models';
import ArticleCard from '../articles/ArticleCard';

interface SearchResultsProps {
  articles: Article[];
  query: string;
  total: number;
  isLoading: boolean;
  hasSearched: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onMarkRead?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'like' | 'dislike' | null) => void;
  onGenerateAudio?: (id: string) => Promise<void>;
}

export default function SearchResults({
  articles,
  query,
  total,
  isLoading,
  hasSearched,
  onLoadMore,
  hasMore = false,
  onMarkRead,
  onToggleFavorite,
  onFeedback,
  onGenerateAudio,
}: SearchResultsProps) {
  // Show empty state if no search has been performed
  if (!hasSearched && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 space-y-6"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            className="w-32 h-32 text-pumpkin/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </motion.div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-creepy text-ghost">Begin Your Search</h3>
          <p className="text-fog/70 max-w-md">
            Enter your query above to summon articles from the depths of your archive...
          </p>
        </div>
      </motion.div>
    );
  }

  // Show loading state
  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-haunted-black/40 via-graveyard/60 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-8"
          >
            <div className="space-y-4">
              <div className="h-8 bg-graveyard/50 rounded-lg animate-pulse" />
              <div className="h-4 bg-graveyard/50 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-graveyard/50 rounded w-1/2 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Show no results state
  if (hasSearched && articles.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-6"
      >
        {/* Spooky ghost animation */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <svg className="w-40 h-40 text-fog/30" viewBox="0 0 200 200" fill="currentColor">
            {/* Ghost body */}
            <path d="M100 40 C60 40 40 60 40 100 L40 160 L50 150 L60 160 L70 150 L80 160 L90 150 L100 160 L110 150 L120 160 L130 150 L140 160 L150 150 L160 160 L160 100 C160 60 140 40 100 40 Z" />
            {/* Eyes */}
            <circle cx="75" cy="90" r="8" fill="#0a0a0a" />
            <circle cx="125" cy="90" r="8" fill="#0a0a0a" />
            {/* Mouth */}
            <ellipse cx="100" cy="115" rx="15" ry="8" fill="#0a0a0a" />
          </svg>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-fog/40 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 20}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        <div className="text-center space-y-3">
          <h3 className="text-3xl font-creepy text-ghost">No Spirits Found</h3>
          <p className="text-fog/70 max-w-md">
            The void returned empty for "{query}". Try different keywords or adjust your filters.
          </p>
          <div className="pt-4 space-y-2 text-sm text-fog/60">
            <p>💀 Check your spelling</p>
            <p>🕷️ Try broader search terms</p>
            <p>🦇 Remove some filters</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show results
  return (
    <div className="space-y-6">
      {/* Results header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg className="w-6 h-6 text-poison-green" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-ghost">
              {total} {total === 1 ? 'Spirit' : 'Spirits'} Summoned
            </h3>
            {query && <p className="text-sm text-fog/70">Results for "{query}"</p>}
          </div>
        </div>
      </motion.div>

      {/* Article results with ghost fade-in animation */}
      <AnimatePresence mode="popLayout">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              filter: 'blur(10px)',
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
          >
            <ArticleCard
              article={article}
              onMarkRead={onMarkRead}
              onToggleFavorite={onToggleFavorite}
              onFeedback={onFeedback}
              onGenerateAudio={onGenerateAudio}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-pumpkin/20 to-pumpkin/10 hover:from-pumpkin/30 hover:to-pumpkin/20 border border-pumpkin/40 rounded-xl text-pumpkin font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pumpkin/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
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
                Summoning More Spirits...
              </span>
            ) : (
              'Summon More Spirits'
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Loading indicator for pagination */}
      {isLoading && articles.length > 0 && (
        <div className="flex justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-pumpkin/20 border-t-pumpkin rounded-full"
          />
        </div>
      )}
    </div>
  );
}
