/**
 * Test script for AI summarization service
 *
 * This script demonstrates the AI service functionality by:
 * 1. Creating a sample article
 * 2. Generating AI summary, topics, and entities
 * 3. Verifying caching works correctly
 *
 * Usage: tsx src/test-ai-service.ts
 */

import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { ArticleModel } from './models/Article.js';
import { FeedModel } from './models/Feed.js';
import { generateArticleAnalysis } from './services/aiService.js';

dotenv.config();

async function testAIService() {
  console.log('🎃 Testing AI Summarization Service\n');

  // Initialize database
  initializeDatabase();
  runMigrations();

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not configured in .env file');
    console.log('Please add your OpenAI API key to the .env file to test AI features');
    process.exit(1);
  }

  console.log('✅ OpenAI API key configured\n');

  // Create a test feed if it doesn't exist
  let testFeed = FeedModel.findByUrl('https://test.example.com/feed');
  if (!testFeed) {
    console.log('Creating test feed...');
    testFeed = FeedModel.create({
      url: 'https://test.example.com/feed',
      title: 'Test Feed',
      description: 'A test feed for AI service testing',
    });
    console.log(`✅ Test feed created: ${testFeed.id}\n`);
  }

  // Create a sample article
  console.log('Creating sample article...');
  const sampleArticle = ArticleModel.create({
    feedId: testFeed.id,
    title: 'The Future of Artificial Intelligence in Content Curation',
    link: 'https://test.example.com/article-1',
    content: `
      Artificial intelligence is revolutionizing how we consume and curate content online. 
      Large language models like GPT-4 from OpenAI have demonstrated remarkable capabilities 
      in understanding and summarizing complex information. These models can process vast 
      amounts of text and extract key insights, making them invaluable for RSS feed readers 
      and content aggregation platforms.
      
      The technology behind these AI systems relies on transformer architectures and massive 
      training datasets. Companies like Microsoft, Google, and Anthropic are investing heavily 
      in this space, pushing the boundaries of what's possible with natural language processing.
      
      For users, this means more personalized content recommendations, better summaries, and 
      intelligent filtering of information overload. The future of content consumption is being 
      shaped by these AI advancements, making it easier than ever to stay informed without 
      being overwhelmed.
      
      However, challenges remain around accuracy, bias, and the ethical implications of 
      AI-generated content. As these systems become more prevalent, it's crucial to maintain 
      transparency and human oversight in content curation processes.
    `,
    excerpt: 'Exploring how AI is transforming content curation and RSS feed reading...',
    author: 'Tech Journalist',
    publishedAt: new Date(),
  });

  console.log(`✅ Sample article created: ${sampleArticle.id}`);
  console.log(`   Title: ${sampleArticle.title}\n`);

  // Test 1: Generate AI analysis (first time - should call API)
  console.log('📝 Test 1: Generating AI analysis (first time)...');
  console.log('   This may take up to 10 seconds...\n');

  const startTime1 = Date.now();
  const analysis1 = await generateArticleAnalysis(sampleArticle.id);
  const duration1 = Date.now() - startTime1;

  if (analysis1) {
    console.log('✅ AI analysis generated successfully!');
    console.log(`   Duration: ${duration1}ms\n`);
    console.log('📄 Summary:');
    console.log(`   ${analysis1.summary}\n`);
    console.log('🏷️  Topics:');
    analysis1.topics.forEach((topic) => console.log(`   - ${topic}`));
    console.log('\n🎯 Entities:');
    analysis1.entities.forEach((entity) => console.log(`   - ${entity}`));
    console.log('\n');
  } else {
    console.error('❌ Failed to generate AI analysis');
    process.exit(1);
  }

  // Test 2: Retrieve cached analysis (should be instant)
  console.log('📝 Test 2: Retrieving cached analysis...\n');

  const startTime2 = Date.now();
  const analysis2 = await generateArticleAnalysis(sampleArticle.id);
  const duration2 = Date.now() - startTime2;

  if (analysis2) {
    console.log('✅ Cached analysis retrieved successfully!');
    console.log(`   Duration: ${duration2}ms (should be <100ms)\n`);

    // Verify it's the same data
    if (analysis2.summary === analysis1.summary) {
      console.log('✅ Cache verification passed - same summary returned\n');
    } else {
      console.error('❌ Cache verification failed - different summary returned\n');
    }
  }

  // Test 3: Verify data is stored in database
  console.log('📝 Test 3: Verifying database storage...\n');

  const updatedArticle = ArticleModel.findById(sampleArticle.id);
  if (updatedArticle) {
    console.log('✅ Article found in database');
    console.log(`   Has summary: ${updatedArticle.summary ? 'Yes' : 'No'}`);
    console.log(`   Topics count: ${updatedArticle.topics.length}`);
    console.log(`   Entities count: ${updatedArticle.entities.length}\n`);
  }

  // Cleanup
  console.log('🧹 Cleaning up test data...');
  ArticleModel.delete(sampleArticle.id);
  console.log('✅ Test article deleted\n');

  console.log('🎉 All tests completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - First analysis: ${duration1}ms`);
  console.log(`   - Cached analysis: ${duration2}ms`);
  console.log(`   - Speed improvement: ${Math.round(duration1 / duration2)}x faster\n`);
}

// Run tests
testAIService().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
