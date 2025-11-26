import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { FeedModel } from './models/Feed.js';
import { ArticleModel } from './models/Article.js';
import { UserPreferencesModel } from './models/UserPreferences.js';
import { PreferenceWeightModel } from './models/PreferenceWeight.js';
import { updateAllRelevanceScores } from './services/relevanceScoring.js';
import { processFeedback, getFeedbackStats } from './services/feedbackLearning.js';

console.log('🎃 Testing Content Filtering and Personalization System\n');

// Initialize database
initializeDatabase();
runMigrations();

// Test 1: Set up user preferences
console.log('📝 Test 1: Setting up user preferences...');
const preferences = UserPreferencesModel.update({
  interests: ['AI', 'Machine Learning', 'Technology'],
  excludedTopics: ['Politics', 'Sports'],
});
console.log('✅ Preferences set:', {
  interests: preferences.interests,
  excludedTopics: preferences.excludedTopics,
});
console.log();

// Test 2: Create test feed and articles
console.log('📝 Test 2: Creating test articles...');
const feed = FeedModel.create({
  url: 'https://example.com/feed',
  title: 'Test Feed',
});

const article1 = ArticleModel.create({
  feedId: feed.id,
  title: 'Introduction to Machine Learning',
  link: 'https://example.com/ml-intro',
  content: 'Machine learning is a subset of artificial intelligence...',
  publishedAt: new Date(),
});

const article2 = ArticleModel.create({
  feedId: feed.id,
  title: 'Latest Political News',
  link: 'https://example.com/politics',
  content: 'Political developments in the region...',
  publishedAt: new Date(),
});

const article3 = ArticleModel.create({
  feedId: feed.id,
  title: 'Sports Championship Results',
  link: 'https://example.com/sports',
  content: 'The championship game ended with...',
  publishedAt: new Date(),
});

// Add topics to articles
ArticleModel.update(article1.id, {
  topics: ['Machine Learning', 'AI', 'Technology'],
  entities: ['Neural Networks', 'Deep Learning'],
});

ArticleModel.update(article2.id, {
  topics: ['Politics', 'Government'],
  entities: ['Congress', 'Senate'],
});

ArticleModel.update(article3.id, {
  topics: ['Sports', 'Basketball'],
  entities: ['NBA', 'Championship'],
});

console.log('✅ Created 3 test articles');
console.log();

// Test 3: Calculate relevance scores
console.log('📝 Test 3: Calculating relevance scores...');
const updatedCount = updateAllRelevanceScores();
console.log(`✅ Updated ${updatedCount} articles`);

const articles = ArticleModel.findAll();
articles.forEach((article) => {
  console.log(`  - "${article.title}": ${article.relevanceScore.toFixed(3)}`);
});
console.log();

// Test 4: Test feedback learning
console.log('📝 Test 4: Testing feedback learning...');

// Like the ML article
console.log('👍 Liking ML article...');
let result = processFeedback(article1.id, 'like');
console.log(`✅ Updated ${result.weightsUpdated} weights`);

// Dislike the politics article
console.log('👎 Disliking politics article...');
result = processFeedback(article2.id, 'dislike');
console.log(`✅ Updated ${result.weightsUpdated} weights`);

// Dislike the sports article
console.log('👎 Disliking sports article...');
result = processFeedback(article3.id, 'dislike');
console.log(`✅ Updated ${result.weightsUpdated} weights`);
console.log();

// Test 5: Check updated relevance scores
console.log('📝 Test 5: Checking updated relevance scores after feedback...');
const updatedArticles = ArticleModel.findAll();
updatedArticles.forEach((article) => {
  console.log(`  - "${article.title}": ${article.relevanceScore.toFixed(3)}`);
});
console.log();

// Test 6: Check preference weights
console.log('📝 Test 6: Checking learned preference weights...');
const weights = PreferenceWeightModel.getAll();
console.log(`✅ Total topics tracked: ${weights.length}`);
weights.slice(0, 5).forEach((weight) => {
  console.log(
    `  - ${weight.topic}: weight=${weight.weight.toFixed(2)}, +${weight.positiveFeedbackCount}/-${weight.negativeFeedbackCount}`
  );
});
console.log();

// Test 7: Get feedback statistics
console.log('📝 Test 7: Getting feedback statistics...');
const stats = getFeedbackStats();
console.log('✅ Feedback stats:', {
  totalFeedback: stats.totalFeedback,
  totalTopics: stats.totalTopics,
});
console.log('Top positive topics:');
stats.topPositiveTopics.forEach((t) => {
  console.log(`  - ${t.topic}: ${t.count} likes, weight=${t.weight.toFixed(2)}`);
});
console.log('Top negative topics:');
stats.topNegativeTopics.forEach((t) => {
  console.log(`  - ${t.topic}: ${t.count} dislikes, weight=${t.weight.toFixed(2)}`);
});
console.log();

console.log('🎃 All tests completed successfully!');
