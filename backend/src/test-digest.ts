import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { FeedModel } from './models/Feed.js';
import { ArticleModel } from './models/Article.js';
import { UserPreferencesModel } from './models/UserPreferences.js';
import { DigestModel } from './models/Digest.js';
import {
  createDigest,
  generateDailyDigest,
  generateWeeklyDigest,
  selectTopArticles,
  identifyTopTopics,
} from './services/digestService.js';

dotenv.config();

async function testDigestGeneration() {
  console.log('🎃 Testing Digest Generation System\n');

  // Initialize database
  initializeDatabase();
  runMigrations();

  // Check if we have feeds and articles
  const feeds = FeedModel.findAll();
  const articles = ArticleModel.findAll();

  console.log(`📊 Database Status:`);
  console.log(`   Feeds: ${feeds.length}`);
  console.log(`   Articles: ${articles.length}\n`);

  if (articles.length === 0) {
    console.log('⚠️  No articles found. Please add some feeds and fetch articles first.');
    console.log('   Run: npm run dev (in backend) and add feeds via the API\n');
    return;
  }

  // Test 1: Select top articles
  console.log('📝 Test 1: Select Top Articles');
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const topArticles = selectTopArticles(5, oneWeekAgo, now);
  console.log(`   Selected ${topArticles.length} top articles`);
  topArticles.forEach((article, index) => {
    console.log(`   ${index + 1}. ${article.title}`);
    console.log(`      Relevance: ${article.relevanceScore.toFixed(2)}`);
  });
  console.log();

  // Test 2: Identify top topics
  console.log('📝 Test 2: Identify Top Topics');
  const topTopics = identifyTopTopics(articles, 5);
  console.log(`   Top topics: ${topTopics.join(', ')}`);
  console.log();

  // Test 3: Generate daily digest
  console.log('📝 Test 3: Generate Daily Digest');
  try {
    const dailyDigest = await generateDailyDigest();
    console.log(`   ✅ Daily digest created: ${dailyDigest.id}`);
    console.log(
      `   Period: ${dailyDigest.periodStart.toISOString()} to ${dailyDigest.periodEnd.toISOString()}`
    );
    console.log(`   Articles: ${dailyDigest.articleIds.length}`);
    console.log(`   Top topics: ${dailyDigest.topTopics.join(', ')}`);
    console.log(`   Summary: ${dailyDigest.summary.substring(0, 100)}...`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 4: Generate weekly digest
  console.log('📝 Test 4: Generate Weekly Digest');
  try {
    const weeklyDigest = await generateWeeklyDigest();
    console.log(`   ✅ Weekly digest created: ${weeklyDigest.id}`);
    console.log(
      `   Period: ${weeklyDigest.periodStart.toISOString()} to ${weeklyDigest.periodEnd.toISOString()}`
    );
    console.log(`   Articles: ${weeklyDigest.articleIds.length}`);
    console.log(`   Top topics: ${weeklyDigest.topTopics.join(', ')}`);
    console.log(`   Summary: ${weeklyDigest.summary.substring(0, 100)}...`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 5: Generate custom digest
  console.log('📝 Test 5: Generate Custom Digest');
  try {
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const customDigest = await createDigest('custom', threeDaysAgo, now, 3);
    console.log(`   ✅ Custom digest created: ${customDigest.id}`);
    console.log(
      `   Period: ${customDigest.periodStart.toISOString()} to ${customDigest.periodEnd.toISOString()}`
    );
    console.log(`   Articles: ${customDigest.articleIds.length}`);
    console.log(`   Top topics: ${customDigest.topTopics.join(', ')}`);
    console.log(`   Summary: ${customDigest.summary.substring(0, 100)}...`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 6: Retrieve latest digest
  console.log('📝 Test 6: Retrieve Latest Digest');
  const latestDigest = DigestModel.findLatest();
  if (latestDigest) {
    console.log(`   ✅ Latest digest: ${latestDigest.id}`);
    console.log(`   Type: ${latestDigest.type}`);
    console.log(`   Generated: ${latestDigest.generatedAt.toISOString()}`);
    console.log(`   Articles: ${latestDigest.articleIds.length}`);
  } else {
    console.log(`   ⚠️  No digests found`);
  }
  console.log();

  // Test 7: Get all digests
  console.log('📝 Test 7: Get All Digests');
  const allDigests = DigestModel.findAll();
  console.log(`   Total digests: ${allDigests.length}`);
  allDigests.forEach((digest, index) => {
    console.log(
      `   ${index + 1}. ${digest.type} - ${digest.generatedAt.toISOString()} (${digest.articleIds.length} articles)`
    );
  });
  console.log();

  // Test 8: User preferences
  console.log('📝 Test 8: User Preferences');
  const preferences = UserPreferencesModel.get();
  console.log(`   Digest frequency: ${preferences.digestFrequency}`);
  console.log(`   Digest time: ${preferences.digestTime}`);
  console.log(`   Digest article count: ${preferences.digestArticleCount}`);
  console.log();

  console.log('✅ All digest tests completed!\n');
}

// Run tests
testDigestGeneration().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
