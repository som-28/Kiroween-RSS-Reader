import { useState, useEffect, useCallback } from 'react';
import { digestService } from '../services/digestService';

const LAST_VIEWED_DIGEST_KEY = 'haunted-last-viewed-digest';
const CHECK_INTERVAL = 60000; // Check every minute

export function useDigestNotification() {
  const [hasNewDigest, setHasNewDigest] = useState(false);
  const [latestDigestId, setLatestDigestId] = useState<string | null>(null);

  const checkForNewDigest = useCallback(async () => {
    try {
      const { digest } = await digestService.getLatestDigest();
      const lastViewedId = localStorage.getItem(LAST_VIEWED_DIGEST_KEY);

      setLatestDigestId(digest.id);
      setHasNewDigest(digest.id !== lastViewedId);
    } catch (error) {
      // No digest available yet or error fetching
      setHasNewDigest(false);
    }
  }, []);

  const markDigestAsViewed = useCallback(
    (digestId?: string) => {
      const idToMark = digestId || latestDigestId;
      if (idToMark) {
        localStorage.setItem(LAST_VIEWED_DIGEST_KEY, idToMark);
        setHasNewDigest(false);
      }
    },
    [latestDigestId]
  );

  useEffect(() => {
    // Check immediately on mount
    checkForNewDigest();

    // Set up periodic checking
    const interval = setInterval(checkForNewDigest, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkForNewDigest]);

  return {
    hasNewDigest,
    latestDigestId,
    checkForNewDigest,
    markDigestAsViewed,
  };
}
