import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ArticleCard from './ArticleCard';
import AudioQueue from './AudioQueue';
import type { Article, RelatedArticle } from '../../types/models';
import { articleService } from '../../services/articleService';
import { useMemoizedSort } from '../../hooks/useMemoizedSort';

interface ArticleListProps {
  feedId?: string;
  isRead?: boolean;
  isFavorite?: boolean;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  topics?: string[];
  startDate?: Date;
  endDate?: Date;
}

interface QueuedAudio {
  id: string;
  audioUrl: string;
  duration?: number;
  title: string;
}

export default function ArticleList({
  feedId,
  isRead,
  isFavorite,
  limit = 20,
  sortBy = 'relevance',
  topics,
  startDate,
  endDate,
}: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticlesMap, setRelatedArticlesMap] = useState<Record<string, RelatedArticle[]>>(
    {}
  );
  const [generatingAudioId, setGeneratingAudioId] = useState<string | null>(null);
  const [audioQueue, setAudioQueue] = useState<QueuedAudio[]>([]);

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadArticles = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const offset = (pageNum - 1) * limit;
        const data = await articleService.getArticles({
          feedId,
          isRead,
          isFavorite,
          limit,
          offset,
          topics,
          startDate,
          endDate,
        });

        // Ensure data is an array
        if (Array.isArray(data)) {
          // Articles will be sorted by the useMemoizedSort hook
          if (reset) {
            setArticles(data);
          } else {
            setArticles((prev) => [...prev, ...data]);
          }

          // Check if there are more articles to load
          setHasMore(data.length === limit);
        } else {
          console.error('API returned non-array data:', data);
          if (reset) {
            setArticles([]);
          }
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
        if (reset) {
          setArticles([]);
        }
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [feedId, isRead, isFavorite, limit, sortBy, topics, startDate, endDate]
  );

  const loadMoreArticles = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadArticles(nextPage, false);
  }, [page, loadArticles]);

  useEffect(() => {
    // Reset and load initial articles when filters change
    setArticles([]);
    setPage(1);
    setHasMore(true);
    loadArticles(1, true);
  }, [loadArticles]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, loadMoreArticles]);

  // Use memoized sorting hook for better performance
  const sortedArticles = useMemoizedSort(articles, sortBy);

  // Memoize callbacks to prevent unnecessary re-renders
  const loadRelatedArticles = useCallback(
    async (articleId: string) => {
      if (relatedArticlesMap[articleId]) return;

      try {
        const related = await articleService.getRelatedArticles(articleId);
        setRelatedArticlesMap((prev) => ({
          ...prev,
          [articleId]: related,
        }));
      } catch (err) {
        console.error('Failed to load related articles:', err);
      }
    },
    [relatedArticlesMap]
  );

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await articleService.updateArticle(id, { isRead: true });
      setArticles((prev) =>
        prev.map((article) => (article.id === id ? { ...article, isRead: true } : article))
      );
    } catch (err) {
      console.error('Failed to mark article as read:', err);
    }
  }, []);

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const article = articles.find((a) => a.id === id);
      if (!article) return;

      try {
        await articleService.updateArticle(id, { isFavorite: !article.isFavorite });
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a))
        );
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      }
    },
    [articles]
  );

  const handleFeedback = useCallback(async (id: string, feedback: 'like' | 'dislike' | null) => {
    try {
      await articleService.submitFeedback(id, { feedback });
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? { ...article, userFeedback: feedback } : article
        )
      );
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  }, []);

  const handleGenerateAudio = useCallback(
    async (id: string) => {
      const article = articles.find((a) => a.id === id);
      if (!article) return;

      // If audio already exists, add to queue
      if (article.audioUrl) {
        setAudioQueue((prev) => {
          if (prev.some((a) => a.id === article.id)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: article.id,
              audioUrl: article.audioUrl!,
              duration: article.audioDuration || undefined,
              title: article.title,
            },
          ];
        });
        return;
      }

      // Generate new audio
      try {
        setGeneratingAudioId(id);
        const { audioUrl, duration } = await articleService.generateAudio(id);

        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, audioUrl, audioDuration: duration } : a))
        );

        setAudioQueue((prev) => [
          ...prev,
          {
            id: article.id,
            audioUrl,
            duration,
            title: article.title,
          },
        ]);
      } catch (err) {
        console.error('Failed to generate audio:', err);
        alert('Failed to generate audio. Please try again.');
      } finally {
        setGeneratingAudioId(null);
      }
    },
    [articles]
  );

  const removeFromAudioQueue = useCallback((id: string) => {
    setAudioQueue((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAudioQueue = useCallback(() => {
    setAudioQueue([]);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-gradient-to-br from-haunted-black/40 via-graveyard/60 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pumpkin/5 to-transparent animate-shimmer" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-8 bg-pumpkin/10 rounded-xl w-3/4"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="h-4 bg-pumpkin/10 rounded-lg w-1/2"
                  />
                </div>
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                  className="w-16 h-16 bg-witch-purple/10 rounded-2xl"
                />
              </div>
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="h-24 bg-poison-green/10 rounded-xl"
              />
              <div className="flex gap-2">
                {[...Array(3)].map((_, j) => (
                  <motion.div
                    key={j}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 + j * 0.1 }}
                    className="h-8 bg-witch-purple/10 rounded-full w-20"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-blood-red/10 via-blood-red/5 to-transparent backdrop-blur-xl border border-blood-red/30 rounded-2xl p-12 text-center overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blood-red/10 rounded-full blur-3xl" />
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            💀
          </motion.div>
          <h3 className="text-2xl font-bold text-blood-red mb-3">Something Went Wrong</h3>
          <p className="text-fog/80 mb-6 max-w-md mx-auto">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadArticles(1, true)}
            className="px-8 py-3 bg-gradient-to-r from-blood-red/30 to-blood-red/20 hover:from-blood-red/40 hover:to-blood-red/30 border border-blood-red/50 text-blood-red font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blood-red/20"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (articles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-pumpkin/10 via-pumpkin/5 to-transparent backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-16 text-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-pumpkin/10 rounded-full blur-3xl" />
        <div className="relative">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-6"
          >
            👻
          </motion.div>
          <h3 className="text-2xl font-bold text-pumpkin mb-3">No Articles Found</h3>
          <p className="text-fog/80 max-w-md mx-auto">
            {feedId
              ? 'This feed has no articles yet. Check back later!'
              : 'Start by adding some RSS feeds to discover amazing content.'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Grid layout - 2 columns on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            onViewportEnter={() => loadRelatedArticles(article.id)}
          >
            <ArticleCard
              article={article}
              onMarkRead={handleMarkRead}
              onToggleFavorite={handleToggleFavorite}
              onFeedback={handleFeedback}
              onGenerateAudio={handleGenerateAudio}
              relatedArticles={relatedArticlesMap[article.id]}
              isGeneratingAudio={generatingAudioId === article.id}
            />
          </motion.div>
        ))}

        {/* Loading more indicator - Grid layout */}
        {loadingMore && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`loading-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-gradient-to-br from-haunted-black/40 via-graveyard/60 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-8 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pumpkin/5 to-transparent animate-shimmer" />
                <div className="relative space-y-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-8 bg-pumpkin/10 rounded-xl w-3/4"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="h-4 bg-pumpkin/10 rounded-lg w-1/2"
                      />
                    </div>
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                      className="w-16 h-16 bg-witch-purple/10 rounded-2xl"
                    />
                  </div>
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="h-24 bg-poison-green/10 rounded-xl"
                  />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, j) => (
                      <motion.div
                        key={j}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 + j * 0.1 }}
                        className="h-8 bg-witch-purple/10 rounded-full w-20"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Infinite scroll observer target */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-20 flex items-center justify-center col-span-full">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-fog/50 text-sm"
          >
            Loading more articles...
          </motion.div>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 col-span-full"
        >
          <div className="text-fog/50 text-sm">
            👻 You've reached the end of the haunted archives
          </div>
        </motion.div>
      )}

      {/* Audio Queue */}
      <AudioQueue queue={audioQueue} onRemove={removeFromAudioQueue} onClear={clearAudioQueue} />
    </>
  );
}
