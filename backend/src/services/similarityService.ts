import { ArticleModel } from '../models/Article.js';
import { ArticleConnectionModel } from '../models/ArticleConnection.js';
import type { Article, CreateArticleConnectionInput } from '../types/models.js';

// Configuration
const SIMILARITY_THRESHOLD = 0.7; // Minimum similarity score to create connection
const MIN_SHARED_ELEMENTS = 1; // Minimum shared topics/entities for connection

/**
 * Calculate cosine similarity between two vectors
 * @param vec1 - First embedding vector
 * @param vec2 - Second embedding vector
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Find shared elements between two arrays
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array of shared elements
 */
function findSharedElements(arr1: string[], arr2: string[]): string[] {
  const set1 = new Set(arr1.map((s) => s.toLowerCase()));
  const set2 = new Set(arr2.map((s) => s.toLowerCase()));

  return Array.from(set1).filter((item) => set2.has(item));
}

/**
 * Detect shared topics and entities between two articles
 * @param article1 - First article
 * @param article2 - Second article
 * @returns Object with shared topics and entities
 */
export function detectSharedElements(
  article1: Article,
  article2: Article
): { topics: string[]; entities: string[]; all: string[] } {
  const sharedTopics = findSharedElements(article1.topics, article2.topics);
  const sharedEntities = findSharedElements(article1.entities, article2.entities);

  return {
    topics: sharedTopics,
    entities: sharedEntities,
    all: [...sharedTopics, ...sharedEntities],
  };
}

/**
 * Calculate similarity between two articles using embeddings
 * @param article1 - First article
 * @param article2 - Second article
 * @returns Similarity score between 0 and 1, or null if embeddings missing
 */
export function calculateArticleSimilarity(article1: Article, article2: Article): number | null {
  if (!article1.embedding || !article2.embedding) {
    return null;
  }

  return cosineSimilarity(article1.embedding, article2.embedding);
}

/**
 * Create article connection if similarity is above threshold
 * @param article1 - First article
 * @param article2 - Second article
 * @returns Created connection or null if below threshold
 */
export function createArticleConnection(article1: Article, article2: Article): boolean {
  // Don't connect article to itself
  if (article1.id === article2.id) {
    return false;
  }

  // Check if connection already exists
  if (ArticleConnectionModel.exists(article1.id, article2.id)) {
    return false;
  }

  // Calculate semantic similarity using embeddings
  const semanticSimilarity = calculateArticleSimilarity(article1, article2);

  // Detect shared topics and entities
  const shared = detectSharedElements(article1, article2);

  // Determine connection type and strength
  let connectionType: 'topic' | 'entity' | 'semantic' = 'semantic';
  let strength = 0;
  let sharedElements: string[] = [];

  // Prioritize semantic similarity if available
  if (semanticSimilarity !== null && semanticSimilarity >= SIMILARITY_THRESHOLD) {
    connectionType = 'semantic';
    strength = semanticSimilarity;
    sharedElements = shared.all;
  }
  // Fall back to topic-based connection
  else if (shared.topics.length >= MIN_SHARED_ELEMENTS) {
    connectionType = 'topic';
    // Calculate strength based on number of shared topics (normalized)
    const maxTopics = Math.max(article1.topics.length, article2.topics.length);
    strength = maxTopics > 0 ? shared.topics.length / maxTopics : 0;
    sharedElements = shared.topics;
  }
  // Fall back to entity-based connection
  else if (shared.entities.length >= MIN_SHARED_ELEMENTS) {
    connectionType = 'entity';
    // Calculate strength based on number of shared entities (normalized)
    const maxEntities = Math.max(article1.entities.length, article2.entities.length);
    strength = maxEntities > 0 ? shared.entities.length / maxEntities : 0;
    sharedElements = shared.entities;
  }
  // No significant connection found
  else {
    return false;
  }

  // Ensure strength is at least at threshold for non-semantic connections
  if (connectionType !== 'semantic' && strength < 0.3) {
    return false;
  }

  // Create the connection
  const connectionInput: CreateArticleConnectionInput = {
    article1Id: article1.id,
    article2Id: article2.id,
    connectionType,
    strength,
    sharedElements,
  };

  try {
    ArticleConnectionModel.create(connectionInput);
    return true;
  } catch (error: any) {
    console.error(
      `Failed to create connection between ${article1.id} and ${article2.id}:`,
      error.message
    );
    return false;
  }
}

/**
 * Find similar articles for a given article
 * @param articleId - The article ID to find similar articles for
 * @param limit - Maximum number of similar articles to return
 * @returns Array of similar articles with connection info
 */
export function findSimilarArticles(
  articleId: string,
  limit: number = 5
): Array<{
  article: Article;
  connection: {
    type: 'topic' | 'entity' | 'semantic';
    strength: number;
    sharedElements: string[];
  };
}> {
  const article = ArticleModel.findById(articleId);
  if (!article) {
    return [];
  }

  // Get all connections for this article
  const connections = ArticleConnectionModel.findByArticleId(articleId);

  // Map connections to articles with connection info
  const similarArticles = connections
    .map((conn) => {
      // Determine which article is the "other" one
      const otherArticleId = conn.article1Id === articleId ? conn.article2Id : conn.article1Id;
      const otherArticle = ArticleModel.findById(otherArticleId);

      if (!otherArticle) {
        return null;
      }

      return {
        article: otherArticle,
        connection: {
          type: conn.connectionType,
          strength: conn.strength,
          sharedElements: conn.sharedElements,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.connection.strength - a.connection.strength)
    .slice(0, limit);

  return similarArticles;
}

/**
 * Detect and create connections for a specific article with all other articles
 * @param articleId - The article ID to find connections for
 * @returns Number of connections created
 */
export function detectConnectionsForArticle(articleId: string): number {
  const article = ArticleModel.findById(articleId);
  if (!article) {
    return 0;
  }

  // Get all other articles (excluding this one)
  const allArticles = ArticleModel.findAll();
  let connectionsCreated = 0;

  for (const otherArticle of allArticles) {
    if (otherArticle.id === articleId) {
      continue;
    }

    const created = createArticleConnection(article, otherArticle);
    if (created) {
      connectionsCreated++;
    }
  }

  return connectionsCreated;
}

/**
 * Rebuild all article connections from scratch
 * Useful for recalculating connections after threshold changes
 * @returns Number of connections created
 */
export function rebuildAllConnections(): number {
  console.log('🔗 Rebuilding all article connections...');

  // Clear existing connections
  const allConnections = ArticleConnectionModel.findStrongest(999999);
  allConnections.forEach((conn) => ArticleConnectionModel.delete(conn.id));

  // Get all articles
  const allArticles = ArticleModel.findAll();
  let connectionsCreated = 0;

  // Compare each pair of articles
  for (let i = 0; i < allArticles.length; i++) {
    for (let j = i + 1; j < allArticles.length; j++) {
      const created = createArticleConnection(allArticles[i], allArticles[j]);
      if (created) {
        connectionsCreated++;
      }
    }
  }

  console.log(`✅ Created ${connectionsCreated} article connections`);
  return connectionsCreated;
}
