import OpenAI from 'openai';
import type { Article } from '../types/models.js';

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

// Configuration
const EMBEDDING_MODEL = 'text-embedding-3-small'; // Cost-effective embedding model
const EMBEDDING_TIMEOUT = 10000; // 10 seconds

/**
 * Generate embedding vector for article content
 * @param article - The article to generate embedding for
 * @returns Promise with embedding vector or null on failure
 */
export async function generateEmbedding(article: Article): Promise<number[] | null> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      console.warn('OpenAI API key not configured, skipping embedding generation');
      return null;
    }

    // Prepare text for embedding - combine title, excerpt, and summary
    const textToEmbed = [
      article.title,
      article.summary || article.excerpt || '',
      article.topics.join(' '),
      article.entities.join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .substring(0, 8000); // Limit to 8000 characters

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Embedding generation timeout')), EMBEDDING_TIMEOUT);
    });

    // Create OpenAI API call promise
    const embeddingPromise = client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: textToEmbed,
    });

    // Race between API call and timeout
    const response = await Promise.race([embeddingPromise, timeoutPromise]);

    const embedding = response.data[0]?.embedding;

    if (!embedding || embedding.length === 0) {
      console.warn(`No embedding generated for article ${article.id}`);
      return null;
    }

    return embedding;
  } catch (error: any) {
    console.error(`Error generating embedding for article ${article.id}:`, error.message);
    return null;
  }
}

/**
 * Generate embeddings for multiple articles in batch
 * @param articles - Array of articles to generate embeddings for
 * @returns Promise with map of article IDs to embeddings
 */
export async function generateEmbeddingsBatch(articles: Article[]): Promise<Map<string, number[]>> {
  const results = new Map<string, number[]>();

  // Process articles in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    const embeddings = await Promise.all(
      batch.map(async (article) => {
        const embedding = await generateEmbedding(article);
        return { articleId: article.id, embedding };
      })
    );

    embeddings.forEach(({ articleId, embedding }) => {
      if (embedding) {
        results.set(articleId, embedding);
      }
    });

    // Small delay between batches to respect rate limits
    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Generate and store embedding for an article
 * @param articleId - The article ID
 * @returns Promise with success status
 */
export async function generateAndStoreEmbedding(articleId: string): Promise<boolean> {
  try {
    const { ArticleModel } = await import('../models/Article.js');

    const article = ArticleModel.findById(articleId);
    if (!article) {
      console.error(`Article ${articleId} not found`);
      return false;
    }

    // Check if embedding already exists
    if (article.embedding && article.embedding.length > 0) {
      console.log(`Embedding already exists for article ${articleId}`);
      return true;
    }

    console.log(`Generating embedding for article ${articleId}`);

    // Generate embedding
    const embedding = await generateEmbedding(article);

    if (!embedding) {
      console.error(`Failed to generate embedding for article ${articleId}`);
      return false;
    }

    // Store embedding in database
    ArticleModel.update(articleId, { embedding });

    console.log(`Embedding stored for article ${articleId}`);
    return true;
  } catch (error: any) {
    console.error(`Error generating and storing embedding for ${articleId}:`, error.message);
    return false;
  }
}
