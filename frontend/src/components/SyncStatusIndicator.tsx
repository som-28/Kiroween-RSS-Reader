import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

/**
 * Sync status indicator component
 * Shows online/offline status and pending operations
 */
export function SyncStatusIndicator() {
  const { isOnline, isSyncing, queueSize, hasError, syncQueue } = useOfflineQueue();

  // Don't show anything if online and no pending operations
  if (isOnline && !isSyncing && queueSize === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50"
      >
        <div
          className={`
            px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm
            border-2 flex items-center gap-3
            ${
              !isOnline
                ? 'bg-blood-red/20 border-blood-red text-blood-red'
                : isSyncing
                  ? 'bg-pumpkin-orange/20 border-pumpkin-orange text-pumpkin-orange'
                  : hasError
                    ? 'bg-poison-green/20 border-poison-green text-poison-green'
                    : 'bg-witch-purple/20 border-witch-purple text-witch-purple'
            }
          `}
        >
          {/* Status Icon */}
          <div className="relative">
            {!isOnline ? (
              // Offline icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
            ) : isSyncing ? (
              // Syncing spinner
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
            ) : hasError ? (
              // Error icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              // Pending icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* Status Text */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {!isOnline
                ? 'Offline'
                : isSyncing
                  ? 'Syncing...'
                  : hasError
                    ? 'Sync Error'
                    : 'Pending Sync'}
            </span>
            {queueSize > 0 && (
              <span className="text-xs opacity-80">
                {queueSize} operation{queueSize !== 1 ? 's' : ''} queued
              </span>
            )}
          </div>

          {/* Retry Button (only show on error or when online with pending operations) */}
          {(hasError || (isOnline && queueSize > 0 && !isSyncing)) && (
            <button
              onClick={syncQueue}
              className="ml-2 px-2 py-1 text-xs rounded bg-current/20 hover:bg-current/30 transition-colors"
              disabled={isSyncing}
            >
              Retry
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
