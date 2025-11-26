import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { FeedModel } from './models/Feed.js';
import { ArticleModel } from './models/Article.js';
import { searchArticles, getSearchSuggestions } from './services/searchService.js';

// Initialize database
initializeDatabase();
runMigrations();

console.log('🔍 Testing Search Functionality\n');

// Create test feed if it doesn't exist
let feed = FeedModel.findByUrl('https://test-search.example.com/feed');
if (!feed) {
  feed = FeedModel.create({
    url: 'https://test-search.example.com/feed',
    title: 'Test Search Feed',
    description: 'Feed for testing search functionality',
    fetchInterval: 60,
  });
  console.log('✅ Created test feed:', feed.title);
}

// Create test articles with different content
const testArticles = [
  {
    title: 'Halloween Decorations Guide',
    content:
      'Learn how to create spooky Halloween decorations for your haunted house. From cobwebs to jack-o-lanterns, we cover everything you need.',
    excerpt: 'A comprehensive guide to Halloween decorations',
    topics: ['Halloween', 'Decorations', 'DIY'],
    summary:
      'This article provides tips for creating Halloween decorations including pumpkins, ghosts, and cobwebs.',
  },
  {
    title: 'Ghost Stories from Around the World',
    content:
      'Explore terrifying ghost stories and paranormal encounters from different cultures. These tales will send shivers down your spine.',
    excerpt: 'Collection of spooky ghost stories',
    topics: ['Ghosts', 'Paranormal', 'Stories'],
    summary:
      'A collection of ghost stories and paranormal tales from various cultures around the world.',
  },
  {
    title: 'Pumpkin Carving Techniques',
    content:
      'Master the art of pumpkin carving with these professional techniques. Create amazing jack-o-lanterns that will impress everyone.',
    excerpt: 'Professional pumpkin carving tips',
    topics: ['Pumpkins', 'Halloween', 'Crafts'],
    summary:
      'Learn professional techniques for carving intricate designs into pumpkins for Halloween.',
  },
  {
    title: 'Witch Costume Ideas',
    content:
      'Looking for the perfect witch costume? We have ideas ranging from classic to modern interpretations of this Halloween favorite.',
    excerpt: 'Creative witch costume inspiration',
    topics: ['Costumes', 'Halloween', 'Witches'],
    summary:
      'Discover creative witch costume ideas for Halloween, from traditional to contemporary styles.',
  },
  {
    title: 'Haunted House Design Tips',
    content:
      'Transform your home into a haunted house with these design tips. Create an immersive spooky experience for visitors.',
    excerpt: 'Tips for designing a haunted house',
    topics: ['Haunted Houses', 'Design', 'Halloween'],
    summary: 'Professional tips for designing and setting up a haunted house attraction.',
  },
];

// Create articles if they don't exist
testArticles.forEach((articleData, index) => {
  const link = `https://test-search.example.com/article-${index + 1}`;
  let article = ArticleModel.findByLink(link);

  if (!article) {
    article = ArticleModel.create({
      feedId: feed!.id,
      title: articleData.title,
      link,
      content: articleData.content,
      excerpt: articleData.excerpt,
      publishedAt: new Date(Date.now() - index * 86400000), // Stagger by days
    });

    // Update with AI-generated fields
    ArticleModel.update(article.id, {
      summary: articleData.summary,
      topics: articleData.topics,
      relevanceScore: 0.5 + Math.random() * 0.5, // Random score between 0.5 and 1.0
    });

    console.log(`✅ Created test article: ${articleData.title}`);
  }
});

console.log('\n--- Test 1: Basic Search ---');
const results1 = searchArticles('Halloween', {}, 1, 10);
console.log(`Query: "Halloween"`);
console.log(`Total results: ${results1.total}`);
console.log(`Results on page 1:`);
results1.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title} (relevance: ${result.relevanceRank})`);
  console.log(`     Highlighted title: ${result.highlights.title}`);
});

console.log('\n--- Test 2: Search with Topic Filter ---');
const results2 = searchArticles('', { topics: ['Ghosts'] }, 1, 10);
console.log(`Query: "" with topic filter: ["Ghosts"]`);
console.log(`Total results: ${results2.total}`);
results2.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title}`);
  console.log(`     Topics: ${result.article.topics.join(', ')}`);
});

console.log('\n--- Test 3: Search with Date Range ---');
const endDate = new Date();
const startDate = new Date(Date.now() - 2 * 86400000); // Last 2 days
const results3 = searchArticles('', { startDate, endDate }, 1, 10);
console.log(`Query: "" with date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
console.log(`Total results: ${results3.total}`);
results3.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title}`);
  console.log(`     Published: ${result.article.publishedAt.toISOString()}`);
});

console.log('\n--- Test 4: Search with Feed Filter ---');
const results4 = searchArticles('', { feedIds: [feed.id] }, 1, 10);
console.log(`Query: "" with feed filter: [${feed.id}]`);
console.log(`Total results: ${results4.total}`);
results4.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title}`);
});

console.log('\n--- Test 5: Combined Search and Filters ---');
const results5 = searchArticles('pumpkin', { topics: ['Halloween'] }, 1, 10);
console.log(`Query: "pumpkin" with topic filter: ["Halloween"]`);
console.log(`Total results: ${results5.total}`);
results5.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title} (relevance: ${result.relevanceRank})`);
  console.log(`     Topics: ${result.article.topics.join(', ')}`);
});

console.log('\n--- Test 6: Pagination ---');
const results6Page1 = searchArticles('', {}, 1, 2);
const results6Page2 = searchArticles('', {}, 2, 2);
console.log(`Query: "" with pagination (2 per page)`);
console.log(`Page 1 (${results6Page1.results.length} results):`);
results6Page1.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title}`);
});
console.log(`Page 2 (${results6Page2.results.length} results):`);
results6Page2.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title}`);
});
console.log(`Total pages: ${results6Page1.totalPages}`);

console.log('\n--- Test 7: Search Suggestions ---');
const suggestions1 = getSearchSuggestions('Hallo', 5);
console.log(`Query: "Hallo"`);
console.log(`Suggestions: ${suggestions1.join(', ')}`);

const suggestions2 = getSearchSuggestions('Ghost', 5);
console.log(`Query: "Ghost"`);
console.log(`Suggestions: ${suggestions2.join(', ')}`);

console.log('\n--- Test 8: Keyword Highlighting ---');
const results8 = searchArticles('spooky haunted', {}, 1, 5);
console.log(`Query: "spooky haunted"`);
results8.results.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.article.title}`);
  if (result.highlights.content) {
    console.log(`     Content: ${result.highlights.content.substring(0, 150)}...`);
  }
});

console.log('\n✅ Search functionality tests completed!');
