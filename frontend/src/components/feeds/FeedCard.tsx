import { motion } from 'framer-motion';
import { Feed } from '../../services/feedService';

interface FeedCardProps {
  feed: Feed;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isRefreshing?: boolean;
}

export default function FeedCard({
  feed,
  onRefresh,
  onDelete,
  onEdit,
  isRefreshing,
}: FeedCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'from-poison-green to-poison-green/50',
          textColor: 'text-poison-green',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'error':
        return {
          color: 'from-blood-red to-blood-red/50',
          textColor: 'text-blood-red',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'paused':
        return {
          color: 'from-fog to-fog/50',
          textColor: 'text-fog',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          color: 'from-fog to-fog/50',
          textColor: 'text-fog',
          icon: null,
        };
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const statusConfig = getStatusConfig(feed.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative h-full"
    >
      <article
        className="relative h-full flex flex-col bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/20 rounded-xl p-4 hover:border-pumpkin/40 transition-all duration-200 overflow-hidden"
        aria-label={`Feed: ${feed.title}`}
      >
        {/* Gradient overlay */}
        <div
          className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${statusConfig.color} rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`}
        />

        <div className="relative space-y-3 flex flex-col h-full">
          {/* Header - Fixed height */}
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-ghost line-clamp-1 group-hover:text-pumpkin transition-colors">
                {feed.title}
              </h3>
              {feed.description && (
                <p className="text-xs text-fog/70 mt-0.5 line-clamp-1">{feed.description}</p>
              )}
            </div>

            {/* Status badge */}
            <div
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${statusConfig.color} backdrop-blur-sm rounded-xl ${statusConfig.textColor}`}
              role="status"
              aria-label={`Feed status: ${feed.status}`}
            >
              <span aria-hidden="true">{statusConfig.icon}</span>
              <span className="text-xs font-bold uppercase">{feed.status}</span>
            </div>
          </div>

          {/* Stats - Fixed height */}
          <div className="flex items-center gap-4 text-sm text-fog/70 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                  clipRule="evenodd"
                />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
              <span className="font-medium" aria-label={`${feed.articleCount} articles`}>
                {feed.articleCount}
              </span>
            </div>
            <span className="text-fog/40" aria-hidden="true">
              •
            </span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span aria-label={`Last updated ${formatDate(feed.lastFetched)}`}>
                {formatDate(feed.lastFetched)}
              </span>
            </div>
          </div>

          {/* Error message - Flexible space */}
          <div className="flex-1 min-h-0">
            {feed.errorMessage && (
              <div className="bg-blood-red/10 border border-blood-red/30 rounded-xl p-3">
                <div className="flex items-start gap-2 text-sm text-blood-red">
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
                  <span className="flex-1 line-clamp-2">{feed.errorMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons - Fixed at bottom */}
          <div className="flex items-center gap-2 pt-2 mt-auto flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRefresh(feed.id)}
              disabled={isRefreshing}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-witch-purple/20 to-witch-purple/10 hover:from-witch-purple/30 hover:to-witch-purple/20 border border-witch-purple/40 rounded-xl text-witch-purple font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label={isRefreshing ? 'Refreshing feed' : 'Refresh feed'}
              aria-busy={isRefreshing}
            >
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </motion.svg>
              <span className="text-sm">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(feed.id)}
              className="p-2.5 bg-pumpkin/20 hover:bg-pumpkin/30 border border-pumpkin/40 rounded-xl text-pumpkin transition-all duration-300"
              aria-label="Edit feed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(feed.id)}
              className="p-2.5 bg-blood-red/20 hover:bg-blood-red/30 border border-blood-red/40 rounded-xl text-blood-red transition-all duration-300"
              aria-label="Delete feed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
