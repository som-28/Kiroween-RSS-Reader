import { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Article, RelatedArticle } from '../../types/models';
// import LazyImage from '../common/LazyImage'; // TODO: Use for article images

interface ArticleCardProps {
  article: Article;
  onMarkRead?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'like' | 'dislike' | null) => void;
  onGenerateAudio?: (id: string) => Promise<void>;
  relatedArticles?: RelatedArticle[];
  isGeneratingAudio?: boolean;
}

// Memoize the component to prevent unnecessary re-renders
const ArticleCard = memo(function ArticleCard({
  article,
  onMarkRead,
  onToggleFavorite,
  onFeedback,
  onGenerateAudio,
  relatedArticles = [],
  isGeneratingAudio = false,
}: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRelated, setShowRelated] = useState(false);

  // Memoize event handlers to prevent re-creation on every render
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (!article.isRead && onMarkRead) {
      onMarkRead(article.id);
    }
  }, [article.isRead, article.id, onMarkRead]);

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleFavorite) {
        onToggleFavorite(article.id);
      }
    },
    [article.id, onToggleFavorite]
  );

  const handleFeedback = useCallback(
    (e: React.MouseEvent, feedback: 'like' | 'dislike') => {
      e.stopPropagation();
      if (onFeedback) {
        const newFeedback = article.userFeedback === feedback ? null : feedback;
        onFeedback(article.id, newFeedback);
      }
    },
    [article.id, article.userFeedback, onFeedback]
  );

  const handleAudioGenerate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onGenerateAudio) {
        onGenerateAudio(article.id);
      }
    },
    [article.id, onGenerateAudio]
  );

  // Memoize formatted date to avoid recalculation
  const formattedDate = useMemo(() => {
    return new Date(article.publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [article.publishedAt]);

  // Memoize relevance score display
  const relevanceDisplay = useMemo(() => {
    return Math.round(article.relevanceScore * 100);
  }, [article.relevanceScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative h-full"
    >
      {/* Modern card with glassmorphism - Fixed height for consistency */}
      <article
        className="relative h-full flex flex-col bg-gradient-to-br from-haunted-black/40 via-graveyard/60 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/20 rounded-xl shadow-xl hover:shadow-pumpkin/30 hover:border-pumpkin/40 transition-all duration-300 overflow-hidden"
        aria-label={`Article: ${article.title}`}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-pumpkin/5 via-transparent to-witch-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-4 space-y-3 flex flex-col h-full">
          {/* Header with title and metadata */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1 min-w-0">
                <h3
                  className={`text-lg font-bold text-ghost cursor-pointer hover:text-pumpkin transition-colors leading-tight line-clamp-2 ${
                    article.isRead ? 'opacity-50' : ''
                  }`}
                  onClick={handleToggleExpand}
                >
                  {article.title}
                </h3>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-fog/80">
                  {article.author && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {article.author}
                    </span>
                  )}
                  {article.author && <span className="text-pumpkin/30">•</span>}
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formattedDate}
                  </span>
                  {!article.isRead && (
                    <>
                      <span className="text-pumpkin/30">•</span>
                      <span className="px-1.5 py-0.5 bg-poison-green/20 text-poison-green text-[10px] font-semibold rounded-full">
                        New
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Relevance score indicator - Compact */}
              {article.relevanceScore > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                  aria-label={`Relevance score: ${relevanceDisplay} percent match`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-witch-purple/30 to-witch-purple/10 backdrop-blur-sm border border-witch-purple/50 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-lg font-bold text-witch-purple" aria-hidden="true">
                        {relevanceDisplay}
                      </span>
                      <span
                        className="text-[8px] text-witch-purple/70 font-medium"
                        aria-hidden="true"
                      >
                        MATCH
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* AI Summary with modern badge - Compact - Fixed height */}
          <div className="flex-1 min-h-0 flex-shrink-0">
            {article.summary && (
              <div className="relative h-full bg-gradient-to-br from-poison-green/10 via-poison-green/5 to-transparent backdrop-blur-sm border border-poison-green/30 rounded-lg p-3 overflow-hidden">
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg
                      className="w-3 h-3 text-poison-green"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 7H7v6h6V7z" />
                      <path
                        fillRule="evenodd"
                        d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-poison-green uppercase tracking-wide">
                      AI Summary
                    </span>
                  </div>
                  <p
                    className="text-sm text-ghost/90 leading-snug line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: article.summary
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/\s+/g, ' ')
                        .trim(),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Excerpt (if no summary) */}
            {!article.summary && article.excerpt && (
              <p
                className="text-sm text-fog/80 leading-snug line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: article.excerpt
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/\s+/g, ' ')
                    .trim(),
                }}
              />
            )}
          </div>

          {/* Topic tags - modern pills - Compact - Fixed height */}
          {article.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 flex-shrink-0 min-h-[32px]">
              {article.topics
                .filter((topic) => topic.length > 3) // Filter out very short words
                .slice(0, 5)
                .map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="relative px-2.5 py-1 bg-gradient-to-r from-witch-purple/20 to-witch-purple/10 backdrop-blur-sm border border-witch-purple/40 rounded-full hover:border-witch-purple/60 transition-all duration-200 cursor-pointer">
                      <span className="text-xs text-witch-purple font-medium capitalize">
                        {topic}
                      </span>
                    </div>
                  </motion.div>
                ))}
              {article.topics.filter((t) => t.length > 3).length > 5 && (
                <span className="text-xs text-fog/60">
                  +{article.topics.filter((t) => t.length > 3).length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Expandable full content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-pumpkin/20">
                  <div
                    className="prose prose-invert prose-sm max-w-none text-ghost
                      prose-headings:text-ghost prose-headings:font-bold
                      prose-p:text-ghost/90 prose-p:leading-relaxed
                      prose-a:text-pumpkin prose-a:no-underline hover:prose-a:text-pumpkin/80
                      prose-strong:text-ghost prose-strong:font-bold
                      prose-img:rounded-xl prose-img:shadow-xl prose-img:my-4 prose-img:w-full prose-img:h-auto
                      [&_img]:rounded-xl [&_img]:shadow-xl [&_img]:my-4 [&_img]:w-full [&_img]:h-auto [&_img]:object-cover"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-pumpkin hover:text-pumpkin/80 transition-colors"
                  >
                    Read original article →
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons - Uniform sizing */}
          <div className="flex items-center justify-between pt-3 border-t border-pumpkin/10 mt-auto flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Expand/Collapse button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleExpand}
                className="px-3 py-2 bg-gradient-to-r from-pumpkin/20 to-pumpkin/10 hover:from-pumpkin/30 hover:to-pumpkin/20 border border-pumpkin/40 rounded-lg text-pumpkin text-xs font-medium transition-all duration-200 min-w-[80px]"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Collapse article content' : 'Expand to read full article'}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {isExpanded ? (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      <span>Less</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span>More</span>
                    </>
                  )}
                </span>
              </motion.button>

              {/* Audio button */}
              {(article.audioUrl || onGenerateAudio) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAudioGenerate}
                  disabled={isGeneratingAudio}
                  className="px-3 py-2 bg-gradient-to-r from-witch-purple/20 to-witch-purple/10 hover:from-witch-purple/30 hover:to-witch-purple/20 border border-witch-purple/40 rounded-lg text-witch-purple text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                  aria-label={
                    isGeneratingAudio
                      ? 'Generating audio summary'
                      : article.audioUrl
                        ? 'Play audio summary'
                        : 'Generate audio summary'
                  }
                  aria-busy={isGeneratingAudio}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {isGeneratingAudio ? (
                      <>
                        <motion.svg
                          className="w-3 h-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </motion.svg>
                        <span>...</span>
                      </>
                    ) : article.audioUrl ? (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Listen</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        <span>Audio</span>
                      </>
                    )}
                  </span>
                </motion.button>
              )}

              {/* Related articles button */}
              {relatedArticles.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRelated(!showRelated)}
                  className="px-3 py-2 bg-gradient-to-r from-poison-green/20 to-poison-green/10 hover:from-poison-green/30 hover:to-poison-green/20 border border-poison-green/40 rounded-lg text-poison-green text-xs font-medium transition-all duration-200 min-w-[80px]"
                  aria-expanded={showRelated}
                  aria-label={`${showRelated ? 'Hide' : 'Show'} ${relatedArticles.length} related articles`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span>Related</span>
                  </span>
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Like/Dislike buttons - Uniform size */}
              {onFeedback && (
                <div
                  className="flex items-center gap-1 bg-graveyard/50 backdrop-blur-sm rounded-lg p-0.5 border border-pumpkin/10"
                  role="group"
                  aria-label="Article feedback"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleFeedback(e, 'like')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      article.userFeedback === 'like'
                        ? 'bg-poison-green/30 text-poison-green'
                        : 'hover:bg-graveyard/80 text-fog/60 hover:text-fog'
                    }`}
                    aria-label="Mark article as interesting"
                    aria-pressed={article.userFeedback === 'like'}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleFeedback(e, 'dislike')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      article.userFeedback === 'dislike'
                        ? 'bg-blood-red/30 text-blood-red'
                        : 'hover:bg-graveyard/80 text-fog/60 hover:text-fog'
                    }`}
                    aria-label="Mark article as not interesting"
                    aria-pressed={article.userFeedback === 'dislike'}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                  </motion.button>
                </div>
              )}

              {/* Favorite button - Uniform size */}
              {onToggleFavorite && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavorite}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    article.isFavorite
                      ? 'bg-blood-red/30 text-blood-red border border-blood-red/40'
                      : 'bg-graveyard/50 hover:bg-graveyard/80 text-fog/60 hover:text-fog border border-pumpkin/10'
                  }`}
                  aria-label={article.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={article.isFavorite}
                >
                  <svg
                    className="w-4 h-4"
                    fill={article.isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>

          {/* Related articles section */}
          <AnimatePresence>
            {showRelated && relatedArticles.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-poison-green/20">
                  <h4 className="text-lg font-creepy text-poison-green mb-3">
                    🔗 Mystical Connections
                  </h4>
                  <div className="space-y-3">
                    {relatedArticles.map((related, index) => (
                      <motion.div
                        key={related.article.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-haunted-black/50 border border-poison-green/30 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-ghost hover:text-pumpkin transition-colors cursor-pointer">
                              {related.article.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 text-xs text-fog">
                              <span className="capitalize">{related.connectionType}</span>
                              <span>•</span>
                              <span>{Math.round(related.strength * 100)}% match</span>
                            </div>
                            {related.sharedElements.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {related.sharedElements.slice(0, 3).map((element) => (
                                  <span
                                    key={element}
                                    className="text-xs bg-poison-green/10 text-poison-green px-2 py-0.5 rounded"
                                  >
                                    {element}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <motion.div
                            className="flex-shrink-0 w-8 h-8"
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 10,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <svg
                              className="w-full h-full text-poison-green"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </motion.div>
  );
});

export default ArticleCard;
