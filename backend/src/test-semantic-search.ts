/**
 * Test script for semantic search and article connections
 *
 * This script tests:
 * - Vector embedding generation
 * - Cosine similarity calculation
 * - Article connection detection
 * - Related articles retrieval
 * - Trending topics detection
 */

import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { ArticleModel } from './models/Article.js';
import { ArticleConnectionModel } from './models/ArticleConnection.js';
import { generateAndStoreEmbedding } from './services/embeddingService.js';
import {
  cosineSimilarity,
  detectSharedElements,
  findSimilarArticles,
  detectConnectionsForArticle,
} from './services/similarityService.js';
import { getTrendingTopics, getTrendingEntities } from './services/trendingService.js';

dotenv.config();

async function testSemanticSearch() {
  console.log('🎃 Testing Semantic Search and Article Connections\n');

  // Initialize database
  initializeDatabase();
  runMigrations();

  // Test 1: Get sample articles
  console.log('📚 Test 1: Fetching sample articles...');
  const articles = ArticleModel.findAll(10);
  console.log(`✅ Found ${articles.length} articles\n`);

  if (articles.length === 0) {
    console.log('⚠️  No articles found. Please add some feeds first.');
    return;
  }

  // Test 2: Generate embeddings for articles without them
  console.log('🔮 Test 2: Generating embeddings...');
  let embeddingsGenerated = 0;

  for (const article of articles.slice(0, 5)) {
    if (!article.embedding) {
      console.log(`  Generating embedding for: ${article.title.substring(0, 50)}...`);
      const success = await generateAndStoreEmbedding(article.id);
      if (success) {
        embeddingsGenerated++;
      }
    } else {
      console.log(`  ✓ Embedding exists for: ${article.title.substring(0, 50)}...`);
    }
  }
  console.log(`✅ Generated ${embeddingsGenerated} new embeddings\n`);

  // Test 3: Test cosine similarity
  console.log('📐 Test 3: Testing cosine similarity...');
  const articlesWithEmbeddings = ArticleModel.findAll().filter((a) => a.embedding);

  if (articlesWithEmbeddings.length >= 2) {
    const article1 = articlesWithEmbeddings[0];
    const article2 = articlesWithEmbeddings[1];

    const similarity = cosineSimilarity(article1.embedding!, article2.embedding!);
    console.log(`  Article 1: ${article1.title.substring(0, 40)}...`);
    console.log(`  Article 2: ${article2.title.substring(0, 40)}...`);
    console.log(`  Similarity: ${(similarity * 100).toFixed(2)}%`);
    console.log('✅ Cosine similarity calculation works\n');
  } else {
    console.log('⚠️  Not enough articles with embeddings for similarity test\n');
  }

  // Test 4: Detect shared elements
  console.log('🔗 Test 4: Testing shared element detection...');
  if (articles.length >= 2) {
    const shared = detectSharedElements(articles[0], articles[1]);
    console.log(`  Article 1 topics: ${articles[0].topics.join(', ')}`);
    console.log(`  Article 2 topics: ${articles[1].topics.join(', ')}`);
    console.log(`  Shared topics: ${shared.topics.join(', ') || 'none'}`);
    console.log(`  Shared entities: ${shared.entities.join(', ') || 'none'}`);
    console.log('✅ Shared element detection works\n');
  }

  // Test 5: Create article connections
  console.log('🕸️  Test 5: Creating article connections...');
  let connectionsCreated = 0;

  if (articlesWithEmbeddings.length >= 2) {
    for (let i = 0; i < Math.min(3, articlesWithEmbeddings.length); i++) {
      const connections = detectConnectionsForArticle(articlesWithEmbeddings[i].id);
      connectionsCreated += connections;
      console.log(`  Created ${connections} connections for article ${i + 1}`);
    }
    console.log(`✅ Created ${connectionsCreated} total connections\n`);
  } else {
    console.log('⚠️  Not enough articles with embeddings for connection test\n');
  }

  // Test 6: Find similar articles
  console.log('🔍 Test 6: Finding similar articles...');
  if (articlesWithEmbeddings.length > 0) {
    const testArticle = articlesWithEmbeddings[0];
    const similarArticles = findSimilarArticles(testArticle.id, 5);

    console.log(`  Source article: ${testArticle.title}`);
    console.log(`  Found ${similarArticles.length} similar articles:`);

    similarArticles.forEach((item, index) => {
      console.log(`    ${index + 1}. ${item.article.title.substring(0, 50)}...`);
      console.log(
        `       Connection: ${item.connection.type} (${(item.connection.strength * 100).toFixed(1)}%)`
      );
      console.log(`       Shared: ${item.connection.sharedElements.slice(0, 3).join(', ')}`);
    });
    console.log('✅ Similar articles retrieval works\n');
  } else {
    console.log('⚠️  No articles with embeddings for similarity search\n');
  }

  // Test 7: Get trending topics
  console.log('📈 Test 7: Getting trending topics...');
  const trendingTopics = getTrendingTopics(7, 10);

  if (trendingTopics.length > 0) {
    console.log(`  Found ${trendingTopics.length} trending topics:`);
    trendingTopics.slice(0, 5).forEach((topic, index) => {
      console.log(`    ${index + 1}. ${topic.topic}`);
      console.log(
        `       Articles: ${topic.articleCount}, Score: ${topic.trendingScore.toFixed(2)}`
      );
    });
    console.log('✅ Trending topics detection works\n');
  } else {
    console.log('⚠️  No trending topics found (may need more recent articles)\n');
  }

  // Test 8: Get trending entities
  console.log('🏷️  Test 8: Getting trending entities...');
  const trendingEntities = getTrendingEntities(7, 10);

  if (trendingEntities.length > 0) {
    console.log(`  Found ${trendingEntities.length} trending entities:`);
    trendingEntities.slice(0, 5).forEach((entity, index) => {
      console.log(`    ${index + 1}. ${entity.topic}`);
      console.log(
        `       Articles: ${entity.articleCount}, Score: ${entity.trendingScore.toFixed(2)}`
      );
    });
    console.log('✅ Trending entities detection works\n');
  } else {
    console.log('⚠️  No trending entities found\n');
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`  Total articles: ${articles.length}`);
  console.log(`  Articles with embeddings: ${articlesWithEmbeddings.length}`);
  console.log(`  Total connections: ${ArticleConnectionModel.count()}`);
  console.log(`  Trending topics: ${trendingTopics.length}`);
  console.log(`  Trending entities: ${trendingEntities.length}`);

  console.log('\n✨ All tests completed!');
}

// Run tests
testSemanticSearch().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
