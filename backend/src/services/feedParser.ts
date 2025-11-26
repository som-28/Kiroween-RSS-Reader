import Parser from 'rss-parser';
import { FeedModel } from '../models/Feed.js';
import { ArticleModel } from '../models/Article.js';
import { updateArticleRelevanceScore } from './relevanceScoring.js';
import type { CreateArticleInput } from '../types/models.js';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Haunted-RSS-Reader/1.0',
  },
});

interface FeedValidationResult {
  isValid: boolean;
  error?: string;
}

interface FetchResult {
  success: boolean;
  articlesAdded: number;
  error?: string;
}

/**
 * Validates a feed URL format and checks if it's accessible
 */
export async function validateFeedUrl(url: string): Promise<FeedValidationResult> {
  // Basic URL format validation
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol',
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }

  // Try to fetch and parse the feed
  try {
    await parser.parseURL(url);
    return { isValid: true };
  } catch (error: any) {
    return {
      isValid: false,
      error: `Failed to parse feed: ${error.message}`,
    };
  }
}

/**
 * Fetches a feed with retry logic and exponential backoff
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Parser.Output<any>> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (error: any) {
      lastError = error;
      console.error(`Fetch attempt ${attempt + 1} failed for ${url}:`, error.message);

      // Don't retry on certain errors
      if (error.message?.includes('404') || error.message?.includes('403')) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch feed after retries');
}

/**
 * Parses a feed and extracts article data
 */
export async function parseFeed(feedId: string, feedUrl: string): Promise<FetchResult> {
  try {
    const feed = await fetchWithRetry(feedUrl);

    if (!feed.items || feed.items.length === 0) {
      return {
        success: true,
        articlesAdded: 0,
      };
    }

    let articlesAdded = 0;

    for (const item of feed.items) {
      // Skip items without required fields
      if (!item.title || !item.link) {
        continue;
      }

      // Check if article already exists
      const existingArticle = ArticleModel.findByLink(item.link);
      if (existingArticle) {
        continue;
      }

      // Extract content (prefer content over contentSnippet)
      let content = item.content || item.contentSnippet || item.summary || '';

      // Extract and prepend images from various RSS fields
      const images: string[] = [];

      // Check for enclosure (common in podcasts and media feeds)
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        images.push(item.enclosure.url);
      }

      // Check for media:content or media:thumbnail (Media RSS)
      const itemAny = item as any;
      if (itemAny['media:content']) {
        const mediaContent = Array.isArray(itemAny['media:content'])
          ? itemAny['media:content']
          : [itemAny['media:content']];
        mediaContent.forEach((media: any) => {
          if (media.$ && media.$.url && media.$.medium === 'image') {
            images.push(media.$.url);
          }
        });
      }

      if (itemAny['media:thumbnail']) {
        const mediaThumbnail = Array.isArray(itemAny['media:thumbnail'])
          ? itemAny['media:thumbnail']
          : [itemAny['media:thumbnail']];
        mediaThumbnail.forEach((thumb: any) => {
          if (thumb.$ && thumb.$.url) {
            images.push(thumb.$.url);
          }
        });
      }

      // Check for itunes:image (iTunes/Apple Podcasts)
      if (itemAny['itunes:image']?.$ && itemAny['itunes:image'].$.href) {
        images.push(itemAny['itunes:image'].$.href);
      }

      // Prepend images to content if found
      if (images.length > 0) {
        const imageHtml = images
          .map(
            (url) =>
              `<img src="${url}" alt="${item.title}" style="max-width: 100%; height: auto; margin: 1rem 0;" />`
          )
          .join('\n');
        content = imageHtml + '\n' + content;
      }

      // Extract excerpt (first 200 characters of text content, stripping HTML)
      const textContent = content.replace(/<[^>]*>/g, '');
      const excerpt =
        textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;

      // Parse published date
      let publishedAt: Date;
      if (item.pubDate) {
        publishedAt = new Date(item.pubDate);
      } else if (item.isoDate) {
        publishedAt = new Date(item.isoDate);
      } else {
        publishedAt = new Date();
      }

      // Create article input
      const articleInput: CreateArticleInput = {
        feedId,
        title: item.title,
        link: item.link,
        content,
        excerpt,
        author: item.creator || item.author || undefined,
        publishedAt,
      };

      try {
        const article = ArticleModel.create(articleInput);

        // Calculate initial relevance score for the new article
        updateArticleRelevanceScore(article.id);

        // Generate AI analysis and embedding asynchronously (don't block feed parsing)
        (async () => {
          try {
            const { generateArticleAnalysis } = await import('./aiService.js');
            const { generateAndStoreEmbedding } = await import('./embeddingService.js');
            const { detectConnectionsForArticle } = await import('./similarityService.js');
            const { createNotification } = await import('./notificationService.js');

            // Generate summary, topics, and entities first
            await generateArticleAnalysis(article.id);

            // Recalculate relevance score after AI analysis (topics/entities now available)
            updateArticleRelevanceScore(article.id);

            // Check if article should trigger a notification
            const updatedArticle = ArticleModel.findById(article.id);
            if (updatedArticle) {
              createNotification(updatedArticle);
            }

            // Then generate embedding (needs topics/entities for better quality)
            const embeddingGenerated = await generateAndStoreEmbedding(article.id);

            // Detect connections with other articles if embedding was generated
            if (embeddingGenerated) {
              const connectionsCreated = detectConnectionsForArticle(article.id);
              if (connectionsCreated > 0) {
                console.log(
                  `🔗 Created ${connectionsCreated} connections for article ${article.id}`
                );
              }
            }
          } catch (error: any) {
            console.error(
              `Failed to generate AI analysis for article ${article.id}:`,
              error.message
            );
          }
        })();

        articlesAdded++;
      } catch (error: any) {
        console.error(`Failed to create article ${item.link}:`, error.message);
      }
    }

    // Update feed's article count
    if (articlesAdded > 0) {
      FeedModel.incrementArticleCount(feedId, articlesAdded);
    }

    return {
      success: true,
      articlesAdded,
    };
  } catch (error: any) {
    console.error(`Failed to parse feed ${feedUrl}:`, error.message);
    return {
      success: false,
      articlesAdded: 0,
      error: error.message,
    };
  }
}

/**
 * Fetches and parses a feed, updating the feed status
 */
export async function fetchFeed(feedId: string): Promise<FetchResult> {
  const feed = FeedModel.findById(feedId);

  if (!feed) {
    return {
      success: false,
      articlesAdded: 0,
      error: 'Feed not found',
    };
  }

  const result = await parseFeed(feedId, feed.url);

  // Update feed status and last fetched time
  if (result.success) {
    FeedModel.update(feedId, {
      status: 'active',
      lastFetched: new Date(),
      errorMessage: undefined,
    });
  } else {
    FeedModel.update(feedId, {
      status: 'error',
      lastFetched: new Date(),
      errorMessage: result.error || 'Unknown error',
    });
  }

  return result;
}

/**
 * Fetches all active feeds
 */
export async function fetchAllFeeds(): Promise<void> {
  const feeds = FeedModel.findByStatus('active');

  console.log(`🎃 Fetching ${feeds.length} active feeds...`);

  for (const feed of feeds) {
    const result = await fetchFeed(feed.id);
    if (result.success) {
      console.log(`✅ Fetched ${result.articlesAdded} new articles from ${feed.title}`);
    } else {
      console.error(`❌ Failed to fetch ${feed.title}: ${result.error}`);
    }
  }

  console.log('🎃 Feed fetch complete!');
}
