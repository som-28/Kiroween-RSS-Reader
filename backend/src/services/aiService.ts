import type { Article } from '../types/models.js';
import { aiProviderManager } from './aiProviders.js';

/**
 * AI Service for article summarization and analysis
 */

/**
 * Generate a concise summary of an article
 * @param article - The article to summarize
 * @returns Promise with summary text or null on failure
 */
export async function summarizeArticle(article: Article): Promise<string | null> {
  try {
    const result = await aiProviderManager.generateAnalysis(article);
    return result.summary || null;
  } catch (error: any) {
    console.error(`Error summarizing article ${article.id}:`, error.message);
    return null;
  }
}

/**
 * Extract key topics from an article
 * @param article - The article to analyze
 * @returns Promise with array of topics
 */
export async function extractTopics(article: Article): Promise<string[]> {
  try {
    const result = await aiProviderManager.generateAnalysis(article);
    return result.topics;
  } catch (error: any) {
    console.error(`Error extracting topics for article ${article.id}:`, error.message);
    return [];
  }
}

/**
 * Extract named entities from an article
 * @param article - The article to analyze
 * @returns Promise with array of entities
 */
export async function extractEntities(article: Article): Promise<string[]> {
  try {
    const result = await aiProviderManager.generateAnalysis(article);
    return result.entities;
  } catch (error: any) {
    console.error(`Error extracting entities for article ${article.id}:`, error.message);
    return [];
  }
}

/**
 * Generate summary with topics and entities for an article
 * Caches results in the database to avoid re-generation
 * @param articleId - The article ID
 * @returns Promise with summary data or null
 */
export async function generateArticleAnalysis(articleId: string): Promise<{
  summary: string;
  topics: string[];
  entities: string[];
} | null> {
  try {
    const { ArticleModel } = await import('../models/Article.js');

    // Get article from database
    const article = ArticleModel.findById(articleId);
    if (!article) {
      console.error(`Article ${articleId} not found`);
      return null;
    }

    // Check if summary already exists (cached)
    if (article.summary && article.topics.length > 0) {
      console.log(`Using cached analysis for article ${articleId}`);
      return {
        summary: article.summary,
        topics: article.topics,
        entities: article.entities,
      };
    }

    console.log(`Generating AI analysis for article ${articleId}`);

    // Generate all analysis at once (more efficient)
    const result = await aiProviderManager.generateAnalysis(article);

    // If summarization fails, use excerpt as fallback
    const finalSummary = result.summary || article.excerpt || article.content.substring(0, 300);
    const topics = result.topics;
    const entities = result.entities;

    // Update article in database with AI-generated data
    ArticleModel.update(articleId, {
      summary: finalSummary,
      topics,
      entities,
    });

    return {
      summary: finalSummary,
      topics,
      entities,
    };
  } catch (error: any) {
    console.error(`Error generating article analysis for ${articleId}:`, error.message);
    return null;
  }
}
