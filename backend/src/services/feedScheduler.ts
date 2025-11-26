import cron from 'node-cron';
import { FeedModel } from '../models/Feed.js';
import { fetchFeed } from './feedParser.js';

interface FeedFetchAttempt {
  feedId: string;
  attempts: number;
  lastAttempt: Date;
  nextRetryDelay: number; // in minutes
}

// Track failed fetch attempts for exponential backoff
const failedAttempts = new Map<string, FeedFetchAttempt>();

// Base retry delay in minutes
const BASE_RETRY_DELAY = 5;
const MAX_RETRY_DELAY = 240; // 4 hours

/**
 * Calculate next retry delay using exponential backoff
 */
function calculateNextRetryDelay(attempts: number): number {
  const delay = BASE_RETRY_DELAY * Math.pow(2, attempts - 1);
  return Math.min(delay, MAX_RETRY_DELAY);
}

/**
 * Check if a feed should be fetched based on its interval and last fetch time
 */
function shouldFetchFeed(feed: any): boolean {
  if (!feed.lastFetched) {
    return true;
  }

  const now = new Date();
  const lastFetched = new Date(feed.lastFetched);
  const minutesSinceLastFetch = (now.getTime() - lastFetched.getTime()) / (1000 * 60);

  // Check if feed has failed attempts
  const attempt = failedAttempts.get(feed.id);
  if (attempt) {
    const minutesSinceLastAttempt = (now.getTime() - attempt.lastAttempt.getTime()) / (1000 * 60);
    return minutesSinceLastAttempt >= attempt.nextRetryDelay;
  }

  return minutesSinceLastFetch >= feed.fetchInterval;
}

/**
 * Fetch a single feed with exponential backoff on failure
 */
async function fetchFeedWithBackoff(feedId: string): Promise<void> {
  const feed = FeedModel.findById(feedId);
  if (!feed) {
    return;
  }

  const result = await fetchFeed(feedId);

  if (result.success) {
    // Clear failed attempts on success
    failedAttempts.delete(feedId);
    console.log(`✅ Fetched ${result.articlesAdded} new articles from ${feed.title}`);
  } else {
    // Track failed attempt
    const attempt = failedAttempts.get(feedId);
    if (attempt) {
      attempt.attempts++;
      attempt.lastAttempt = new Date();
      attempt.nextRetryDelay = calculateNextRetryDelay(attempt.attempts);
    } else {
      failedAttempts.set(feedId, {
        feedId,
        attempts: 1,
        lastAttempt: new Date(),
        nextRetryDelay: BASE_RETRY_DELAY,
      });
    }

    const currentAttempt = failedAttempts.get(feedId)!;
    console.error(
      `❌ Failed to fetch ${feed.title} (attempt ${currentAttempt.attempts}): ${result.error}. ` +
        `Next retry in ${currentAttempt.nextRetryDelay} minutes`
    );

    // Update feed status to error if multiple failures
    if (currentAttempt.attempts >= 3) {
      FeedModel.update(feedId, {
        status: 'error',
        errorMessage: result.error || 'Multiple fetch failures',
      });
    }
  }
}

/**
 * Fetch all feeds that are due for an update
 */
async function fetchDueFeeds(): Promise<void> {
  const activeFeeds = FeedModel.findByStatus('active');
  const errorFeeds = FeedModel.findByStatus('error');

  // Combine active and error feeds (error feeds will be retried with backoff)
  const allFeeds = [...activeFeeds, ...errorFeeds];

  const dueFeeds = allFeeds.filter(shouldFetchFeed);

  if (dueFeeds.length === 0) {
    console.log('🎃 No feeds due for update');
    return;
  }

  console.log(`🎃 Fetching ${dueFeeds.length} feeds...`);

  // Fetch feeds sequentially to avoid overwhelming the system
  for (const feed of dueFeeds) {
    await fetchFeedWithBackoff(feed.id);
  }

  console.log('🎃 Feed fetch cycle complete!');
}

/**
 * Initialize the feed scheduler
 * Runs every 5 minutes to check for feeds that need updating
 */
export function initializeFeedScheduler(): void {
  console.log('🎃 Initializing feed scheduler...');

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🎃 Running scheduled feed fetch...');
    try {
      await fetchDueFeeds();
    } catch (error: any) {
      console.error('❌ Error in scheduled feed fetch:', error.message);
    }
  });

  // Also run immediately on startup
  setTimeout(async () => {
    console.log('🎃 Running initial feed fetch...');
    try {
      await fetchDueFeeds();
    } catch (error: any) {
      console.error('❌ Error in initial feed fetch:', error.message);
    }
  }, 5000); // Wait 5 seconds after startup

  console.log('✅ Feed scheduler initialized (runs every 5 minutes)');
}

/**
 * Get current backoff status for all feeds
 */
export function getBackoffStatus(): FeedFetchAttempt[] {
  return Array.from(failedAttempts.values());
}

/**
 * Reset backoff for a specific feed (useful for manual refresh)
 */
export function resetBackoff(feedId: string): void {
  failedAttempts.delete(feedId);
}
