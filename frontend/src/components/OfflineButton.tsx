import React, { useState } from 'react';
import { useOfflineArticles } from '../hooks/useOfflineArticles';

interface OfflineButtonProps {
  articleId: string;
  className?: string;
}

export const OfflineButton: React.FC<OfflineButtonProps> = ({ articleId, className = '' }) => {
  const { isMarkedForOffline, markForOffline, unmarkForOffline } = useOfflineArticles();
  const [isProcessing, setIsProcessing] = useState(false);

  const isOffline = isMarkedForOffline(articleId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsProcessing(true);
    try {
      if (isOffline) {
        await unmarkForOffline(articleId);
      } else {
        await markForOffline(articleId);
      }
    } catch (error) {
      console.error('Failed to toggle offline status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
        isOffline
          ? 'bg-poison-green text-haunted-black hover:bg-opacity-80'
          : 'bg-graveyard-gray text-ghost-white hover:bg-opacity-80'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isOffline ? 'Remove from offline' : 'Save for offline'}
    >
      {isProcessing ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill={isOffline ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      <span className="text-sm font-medium">{isOffline ? 'Saved Offline' : 'Save Offline'}</span>
    </button>
  );
};
