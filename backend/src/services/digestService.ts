import { ArticleModel } from '../models/Article.js';
import { DigestModel } from '../models/Digest.js';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import type { Article, Digest } from '../types/models.js';
import OpenAI from 'openai';

// Lazy-initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Select top N articles based on relevance scores
 * @param count - Number of articles to select
 * @param startDate - Start date for article selection
 * @param endDate - End date for article selection
 * @returns Array of top articles
 */
export function selectTopArticles(count: number, startDate: Date, endDate: Date): Article[] {
  // Get articles within date range
  const articles = ArticleModel.findByDateRange(startDate, endDate);

  // Sort by relevance score (descending) and then by published date (descending)
  const sortedArticles = articles.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });

  // Return top N articles
  return sortedArticles.slice(0, count);
}

/**
 * Identify top topics across a set of articles
 * @param articles - Array of articles to analyze
 * @param topN - Number of top topics to return
 * @returns Array of top topics
 */
export function identifyTopTopics(articles: Article[], topN: number = 10): string[] {
  // Count topic frequency
  const topicCounts = new Map<string, number>();

  for (const article of articles) {
    for (const topic of article.topics) {
      const normalizedTopic = topic.toLowerCase().trim();
      topicCounts.set(normalizedTopic, (topicCounts.get(normalizedTopic) || 0) + 1);
    }
  }

  // Sort topics by frequency
  const sortedTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  // Return top N topics
  return sortedTopics.slice(0, topN);
}

/**
 * Generate a digest summary using AI
 * @param articles - Array of articles to summarize
 * @returns Promise with digest summary or fallback text
 */
export async function generateDigestSummary(articles: Article[]): Promise<string> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      console.warn('OpenAI API key not configured, using fallback digest summary');
      return generateFallbackDigestSummary(articles);
    }

    // Create a concise overview of the articles
    const articlesOverview = articles
      .slice(0, 10) // Limit to top 10 for prompt
      .map((article, index) => {
        return `${index + 1}. ${article.title}\n   ${article.summary || article.excerpt || 'No summary available'}`;
      })
      .join('\n\n');

    const prompt = `Create a brief overview (2-3 sentences) of the following curated articles. Highlight the main themes and topics covered:

${articlesOverview}

Overview:`;

    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates concise overviews of article collections.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return generateFallbackDigestSummary(articles);
    }

    return summary;
  } catch (error: any) {
    console.error('Error generating digest summary:', error.message);
    return generateFallbackDigestSummary(articles);
  }
}

/**
 * Generate a fallback digest summary without AI
 * @param articles - Array of articles
 * @returns Fallback summary text
 */
function generateFallbackDigestSummary(articles: Article[]): string {
  const topTopics = identifyTopTopics(articles, 5);
  const topicsText = topTopics.length > 0 ? topTopics.join(', ') : 'various topics';

  return `This digest contains ${articles.length} curated articles covering ${topicsText}. The articles have been selected based on your interests and relevance scores.`;
}

/**
 * Create a new digest
 * @param type - Type of digest (daily, weekly, custom)
 * @param periodStart - Start date of the digest period
 * @param periodEnd - End date of the digest period
 * @param articleCount - Number of articles to include (optional, uses user preference if not provided)
 * @returns Promise with created digest
 */
export async function createDigest(
  type: 'daily' | 'weekly' | 'custom',
  periodStart: Date,
  periodEnd: Date,
  articleCount?: number
): Promise<Digest> {
  try {
    // Get user preferences for article count if not provided
    const preferences = UserPreferencesModel.get();
    const count = articleCount || preferences.digestArticleCount;

    // Select top articles based on relevance scores
    const topArticles = selectTopArticles(count, periodStart, periodEnd);

    if (topArticles.length === 0) {
      console.warn('No articles found for digest period');
      // Create empty digest
      const emptyDigest = DigestModel.create({
        periodStart,
        periodEnd,
        articleIds: [],
        summary: 'No articles available for this period.',
        topTopics: [],
        type,
      });
      return emptyDigest;
    }

    // Identify top topics
    const topTopics = identifyTopTopics(topArticles, 10);

    // Generate digest summary using AI
    const summary = await generateDigestSummary(topArticles);

    // Extract article IDs
    const articleIds = topArticles.map((article) => article.id);

    // Create digest in database
    const digest = DigestModel.create({
      periodStart,
      periodEnd,
      articleIds,
      summary,
      topTopics,
      type,
    });

    console.log(`✅ Created ${type} digest with ${articleIds.length} articles`);

    return digest;
  } catch (error: any) {
    console.error('Error creating digest:', error.message);
    throw error;
  }
}

/**
 * Generate a daily digest
 * @returns Promise with created digest
 */
export async function generateDailyDigest(): Promise<Digest> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return createDigest('daily', yesterday, today);
}

/**
 * Generate a weekly digest
 * @returns Promise with created digest
 */
export async function generateWeeklyDigest(): Promise<Digest> {
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return createDigest('weekly', lastWeek, today);
}
