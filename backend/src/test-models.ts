/**
 * Test script to verify database models work correctly
 * This demonstrates the CRUD operations for all models
 */

import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import {
  FeedModel,
  ArticleModel,
  UserPreferencesModel,
  DigestModel,
  ArticleConnectionModel,
} from './models/index.js';

console.log('🎃 Testing Haunted RSS Reader Database Models\n');

try {
  // Initialize database
  console.log('📦 Initializing database...');
  initializeDatabase();
  runMigrations();
  console.log('✅ Database initialized\n');

  // Test Feed Model
  console.log('🧪 Testing Feed Model...');
  const feed = FeedModel.create({
    url: 'https://example.com/feed.xml',
    title: 'Test Feed',
    description: 'A spooky test feed',
    fetchInterval: 30,
  });
  console.log('✅ Created feed:', feed.id);

  const foundFeed = FeedModel.findById(feed.id);
  console.log('✅ Found feed:', foundFeed?.title);

  const updatedFeed = FeedModel.update(feed.id, {
    status: 'active',
    articleCount: 5,
  });
  console.log('✅ Updated feed article count:', updatedFeed?.articleCount);

  // Test Article Model
  console.log('\n🧪 Testing Article Model...');
  const article = ArticleModel.create({
    feedId: feed.id,
    title: 'Spooky Article',
    link: 'https://example.com/article1',
    content: 'This is a haunted article about ghosts and goblins.',
    excerpt: 'A haunted article...',
    author: 'Ghost Writer',
    publishedAt: new Date(),
  });
  console.log('✅ Created article:', article.id);

  const updatedArticle = ArticleModel.update(article.id, {
    summary: 'AI-generated summary of the spooky article',
    topics: ['halloween', 'ghosts', 'supernatural'],
    entities: ['Ghost Writer', 'Haunted House'],
    relevanceScore: 0.85,
    sentiment: 'neutral',
  });
  console.log('✅ Updated article with AI data');
  console.log('   Topics:', updatedArticle?.topics);
  console.log('   Relevance:', updatedArticle?.relevanceScore);

  // Test User Preferences Model
  console.log('\n🧪 Testing User Preferences Model...');
  const prefs = UserPreferencesModel.get();
  console.log('✅ Got default preferences');
  console.log('   Theme:', prefs.theme);
  console.log('   Digest frequency:', prefs.digestFrequency);

  const updatedPrefs = UserPreferencesModel.update({
    interests: ['halloween', 'horror', 'supernatural'],
    theme: 'haunted-mansion',
    enableAnimations: true,
    digestArticleCount: 15,
  });
  console.log('✅ Updated preferences');
  console.log('   Interests:', updatedPrefs.interests);
  console.log('   Theme:', updatedPrefs.theme);

  // Test Digest Model
  console.log('\n🧪 Testing Digest Model...');
  const digest = DigestModel.create({
    periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
    articleIds: [article.id],
    summary: 'Daily digest of spooky articles',
    topTopics: ['halloween', 'ghosts'],
    type: 'daily',
  });
  console.log('✅ Created digest:', digest.id);
  console.log('   Type:', digest.type);
  console.log('   Articles:', digest.articleIds.length);

  const latestDigest = DigestModel.findLatest();
  console.log('✅ Found latest digest:', latestDigest?.id);

  // Test Article Connection Model
  console.log('\n🧪 Testing Article Connection Model...');

  // Create a second article to connect
  const article2 = ArticleModel.create({
    feedId: feed.id,
    title: 'Another Spooky Article',
    link: 'https://example.com/article2',
    content: 'More haunted content about ghosts.',
    publishedAt: new Date(),
  });

  const connection = ArticleConnectionModel.create({
    article1Id: article.id,
    article2Id: article2.id,
    connectionType: 'topic',
    strength: 0.75,
    sharedElements: ['ghosts', 'halloween'],
  });
  console.log('✅ Created article connection:', connection.id);
  console.log('   Type:', connection.connectionType);
  console.log('   Strength:', connection.strength);
  console.log('   Shared elements:', connection.sharedElements);

  const connections = ArticleConnectionModel.findByArticleId(article.id);
  console.log('✅ Found', connections.length, 'connection(s) for article');

  // Test search and filtering
  console.log('\n🧪 Testing Search and Filtering...');
  const searchResults = ArticleModel.search('spooky');
  console.log('✅ Search found', searchResults.length, 'article(s)');

  const allArticles = ArticleModel.findAll(10);
  console.log('✅ Found', allArticles.length, 'total article(s)');

  const feedArticles = ArticleModel.findByFeedId(feed.id);
  console.log('✅ Found', feedArticles.length, 'article(s) for feed');

  // Cleanup test data
  console.log('\n🧹 Cleaning up test data...');
  ArticleConnectionModel.delete(connection.id);
  ArticleModel.delete(article.id);
  ArticleModel.delete(article2.id);
  DigestModel.delete(digest.id);
  FeedModel.delete(feed.id);
  console.log('✅ Cleanup complete');

  console.log('\n✨ All tests passed! Database models are working correctly.');
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
