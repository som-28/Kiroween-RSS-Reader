import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Article } from '../../types/models';
import type { Digest } from '../../services/digestService';

interface DigestViewProps {
  digest: Digest;
  articles: Article[];
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function DigestView({
  digest,
  articles,
  onRegenerate,
  isRegenerating = false,
}: DigestViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleNextPage = () => {
    if (currentPage < articles.length) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const pageVariants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 180 : -180,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -180 : 180,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const pageTransition = {
    duration: 0.8,
    ease: [0.43, 0.13, 0.23, 0.96],
  };

  // Cover page (page 0)
  const renderCoverPage = () => (
    <motion.div
      key="cover"
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={pageTransition}
      className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-witch-purple/20 via-haunted-black to-pumpkin/20"
    >
      {/* Ornate border */}
      <div className="absolute inset-8 border-4 border-pumpkin/40 rounded-lg" />
      <div className="absolute inset-10 border-2 border-witch-purple/30 rounded-lg" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Mystical icon */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="mx-auto w-24 h-24 text-pumpkin"
        >
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </motion.div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-creepy text-pumpkin">
            {digest.type === 'daily'
              ? '📖 Daily'
              : digest.type === 'weekly'
                ? '📚 Weekly'
                : '✨ Custom'}{' '}
            Digest
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-pumpkin to-transparent" />
        </div>

        {/* Period */}
        <div className="space-y-2 text-ghost">
          <p className="text-xl">
            {formatDate(digest.periodStart)} - {formatDate(digest.periodEnd)}
          </p>
          <p className="text-sm text-fog">
            Generated on {formatDate(digest.generatedAt)} at {formatTime(digest.generatedAt)}
          </p>
        </div>

        {/* Summary */}
        {digest.summary && (
          <div className="max-w-2xl mx-auto">
            <p className="text-ghost/90 leading-relaxed italic">"{digest.summary}"</p>
          </div>
        )}

        {/* Top topics */}
        {digest.topTopics.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-creepy text-witch-purple">Featured Topics</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {digest.topTopics.map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-4 py-2 bg-witch-purple/20 border border-witch-purple/40 rounded-full text-witch-purple font-medium"
                >
                  {topic}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Article count */}
        <div className="pt-8">
          <p className="text-fog text-sm">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'} curated for you
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Article page
  const renderArticlePage = (article: Article, index: number) => (
    <motion.div
      key={`article-${article.id}`}
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={pageTransition}
      className="absolute inset-0 p-12 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page number */}
        <div className="flex items-center justify-between text-sm text-fog">
          <span>
            Article {index + 1} of {articles.length}
          </span>
          <span>
            Page {currentPage} of {articles.length}
          </span>
        </div>

        {/* Article header */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-ghost leading-tight">{article.title}</h2>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-fog">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatDate(article.publishedAt)}
            </span>
            {article.relevanceScore > 0 && (
              <>
                <span className="text-pumpkin/30">•</span>
                <span className="px-2 py-0.5 bg-witch-purple/20 text-witch-purple text-xs font-semibold rounded-full">
                  {Math.round(article.relevanceScore * 100)}% Match
                </span>
              </>
            )}
          </div>
        </div>

        {/* AI Summary */}
        {article.summary && (
          <div className="relative bg-gradient-to-br from-poison-green/10 via-poison-green/5 to-transparent backdrop-blur-sm border border-poison-green/30 rounded-xl p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-poison-green/10 rounded-full blur-3xl" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <motion.div
                  className="flex items-center gap-2 px-3 py-1.5 bg-poison-green/20 border border-poison-green/50 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(57, 255, 20, 0.2)',
                      '0 0 25px rgba(57, 255, 20, 0.4)',
                      '0 0 10px rgba(57, 255, 20, 0.2)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg
                    className="w-4 h-4 text-poison-green"
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
                  <span className="text-xs font-bold text-poison-green uppercase tracking-wide">
                    AI Summary
                  </span>
                </motion.div>
              </div>
              <p className="text-ghost/90 leading-relaxed text-lg">{article.summary}</p>
            </div>
          </div>
        )}

        {/* Article Content - Rendered HTML */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-ghost prose-headings:font-bold
            prose-p:text-ghost/90 prose-p:leading-relaxed
            prose-a:text-pumpkin prose-a:no-underline hover:prose-a:text-pumpkin/80
            prose-strong:text-ghost prose-strong:font-bold
            prose-img:rounded-xl prose-img:shadow-xl prose-img:my-6 prose-img:w-full prose-img:h-auto
            prose-blockquote:border-l-4 prose-blockquote:border-pumpkin/50 prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:text-poison-green prose-code:bg-haunted-black/50 prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-pre:bg-haunted-black/80 prose-pre:border prose-pre:border-pumpkin/20 prose-pre:rounded-xl
            prose-ul:text-ghost/90 prose-ol:text-ghost/90
            prose-li:text-ghost/90
            [&_img]:rounded-xl [&_img]:shadow-xl [&_img]:my-6 [&_img]:w-full [&_img]:h-auto [&_img]:object-cover"
        >
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              wordBreak: 'break-word',
            }}
          />
        </div>

        {/* Topics */}
        {article.topics.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-pumpkin/20">
            <h4 className="text-sm font-semibold text-fog uppercase tracking-wide">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {article.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1.5 bg-witch-purple/20 border border-witch-purple/40 rounded-full text-witch-purple text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Read more link */}
        <div className="pt-6 border-t border-pumpkin/20">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pumpkin hover:text-pumpkin/80 transition-colors font-medium"
          >
            Read original article
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative flex items-center gap-6">
      {/* Left Arrow */}
      <motion.button
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrevPage}
        disabled={currentPage === 0}
        className="flex-shrink-0 p-4 bg-gradient-to-r from-pumpkin/30 to-pumpkin/20 hover:from-pumpkin/40 hover:to-pumpkin/30 border-2 border-pumpkin/50 rounded-full text-pumpkin transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl hover:shadow-pumpkin/30"
        aria-label="Previous page"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* Spellbook container */}
      <div className="flex-1 relative bg-gradient-to-br from-haunted-black via-graveyard to-haunted-black border-4 border-pumpkin/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-witch-purple/50 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-witch-purple/50 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-witch-purple/50 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-witch-purple/50 rounded-br-2xl" />

        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-pumpkin/20 to-transparent" />

        {/* Pages container */}
        <div className="relative min-h-[600px] perspective-1000">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {currentPage === 0
              ? renderCoverPage()
              : renderArticlePage(articles[currentPage - 1], currentPage - 1)}
          </AnimatePresence>
        </div>

        {/* Page indicator and regenerate button - Bottom center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-haunted-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-pumpkin/30">
          <span className="text-fog text-sm whitespace-nowrap">
            {currentPage === 0 ? 'Cover' : `Article ${currentPage} of ${articles.length}`}
          </span>

          {/* Regenerate button */}
          {onRegenerate && currentPage === 0 && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: isRegenerating ? 0 : 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="p-2 bg-gradient-to-r from-witch-purple/30 to-witch-purple/20 hover:from-witch-purple/40 hover:to-witch-purple/30 border border-witch-purple/50 rounded-full text-witch-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Regenerate digest"
            >
              <motion.svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={isRegenerating ? { rotate: 360 } : {}}
                transition={isRegenerating ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                <path d="M12 6c-3.31 0-6 2.69-6 6h2c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4v2c3.31 0 6-2.69 6-6s-2.69-6-6-6z" />
              </motion.svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Right Arrow */}
      <motion.button
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNextPage}
        disabled={currentPage >= articles.length}
        className="flex-shrink-0 p-4 bg-gradient-to-r from-pumpkin/30 to-pumpkin/20 hover:from-pumpkin/40 hover:to-pumpkin/30 border-2 border-pumpkin/50 rounded-full text-pumpkin transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl hover:shadow-pumpkin/30"
        aria-label="Next page"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  );
}
