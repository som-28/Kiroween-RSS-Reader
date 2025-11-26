import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { FeedModel } from './models/Feed.js';
import { ArticleModel } from './models/Article.js';
import { validateFeedUrl, fetchFeed } from './services/feedParser.js';

// Initialize database
initializeDatabase();
runMigrations();

async function testFeedParser() {
  console.log('🎃 Testing RSS Feed Parser...\n');

  // Test 1: Validate a valid feed URL
  console.log('Test 1: Validating feed URL...');
  const testUrl = 'https://hnrss.org/frontpage';
  const validation = await validateFeedUrl(testUrl);
  console.log(`✅ Validation result:`, validation);
  console.log();

  // Test 2: Create a feed
  console.log('Test 2: Creating feed...');
  const feed = FeedModel.create({
    url: testUrl,
    title: 'Hacker News Front Page',
    description: 'Latest stories from Hacker News',
    fetchInterval: 60,
  });
  console.log(`✅ Feed created:`, feed);
  console.log();

  // Test 3: Fetch articles from the feed
  console.log('Test 3: Fetching articles...');
  const result = await fetchFeed(feed.id);
  console.log(`✅ Fetch result:`, result);
  console.log();

  // Test 4: Get articles
  console.log('Test 4: Getting articles...');
  const articles = ArticleModel.findByFeedId(feed.id, 5);
  console.log(`✅ Found ${articles.length} articles`);
  if (articles.length > 0) {
    console.log('First article:', {
      title: articles[0].title,
      link: articles[0].link,
      publishedAt: articles[0].publishedAt,
    });
  }
  console.log();

  // Test 5: Get all feeds
  console.log('Test 5: Getting all feeds...');
  const allFeeds = FeedModel.findAll();
  console.log(`✅ Found ${allFeeds.length} feeds`);
  console.log();

  console.log('🎃 All tests completed!');
}

testFeedParser().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
