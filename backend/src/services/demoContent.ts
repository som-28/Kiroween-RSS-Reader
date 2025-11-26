import { FeedModel } from '../models/Feed.js';
import { fetchFeed } from './feedParser.js';

/**
 * Sample RSS feeds to populate on first run
 */
const SAMPLE_FEEDS = [
  {
    url: 'https://hnrss.org/frontpage',
    title: 'Hacker News - Front Page',
    description: 'The latest tech news and discussions from Hacker News',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    title: 'The Verge',
    description: 'Technology, science, art, and culture news',
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    title: 'Ars Technica',
    description: 'Technology news, analysis, and reviews',
  },
  {
    url: 'https://www.wired.com/feed/rss',
    title: 'WIRED',
    description: 'Technology, business, and culture insights',
  },
  {
    url: 'https://www.reddit.com/r/technology/.rss',
    title: 'Reddit - Technology',
    description: 'Technology discussions from Reddit',
  },
];

/**
 * Checks if demo content has already been loaded
 */
export function isDemoContentLoaded(): boolean {
  const feeds = FeedModel.findAll();
  return feeds.length > 0;
}

/**
 * Loads sample feeds and fetches initial articles
 */
export async function loadDemoContent(): Promise<void> {
  console.log('🎃 Loading demo content...');

  const results = [];

  for (const sampleFeed of SAMPLE_FEEDS) {
    try {
      // Check if feed already exists
      const existingFeed = FeedModel.findByUrl(sampleFeed.url);
      if (existingFeed) {
        console.log(`⏭️  Feed already exists: ${sampleFeed.title}`);
        continue;
      }

      // Create feed
      const feed = FeedModel.create({
        url: sampleFeed.url,
        title: sampleFeed.title,
        description: sampleFeed.description,
        fetchInterval: 60,
      });

      console.log(`✅ Created feed: ${feed.title}`);

      // Fetch initial articles
      const fetchResult = await fetchFeed(feed.id);

      if (fetchResult.success) {
        console.log(`📰 Fetched ${fetchResult.articlesAdded} articles from ${feed.title}`);
        results.push({
          feed: feed.title,
          success: true,
          articlesAdded: fetchResult.articlesAdded,
        });
      } else {
        console.error(`❌ Failed to fetch articles from ${feed.title}: ${fetchResult.error}`);
        results.push({
          feed: feed.title,
          success: false,
          error: fetchResult.error,
        });
      }
    } catch (error: any) {
      console.error(`❌ Failed to add sample feed ${sampleFeed.title}:`, error.message);
      results.push({
        feed: sampleFeed.title,
        success: false,
        error: error.message,
      });
    }
  }

  console.log('🎃 Demo content loading complete!');
  console.log(
    `✅ Successfully loaded: ${results.filter((r) => r.success).length}/${SAMPLE_FEEDS.length} feeds`
  );
}

/**
 * Initializes demo content if needed (called on server start)
 */
export async function initializeDemoContent(): Promise<void> {
  if (!isDemoContentLoaded()) {
    console.log('🎃 No feeds found. Loading demo content...');
    await loadDemoContent();
  } else {
    console.log('✅ Demo content already loaded');
  }
}
