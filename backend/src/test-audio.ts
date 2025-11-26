import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { generateArticleAudio, getAvailableVoices } from './services/ttsService.js';
import { ArticleModel } from './models/Article.js';

dotenv.config();

async function testAudioGeneration() {
  console.log('🎃 Testing Audio Generation Service\n');

  // Initialize database
  initializeDatabase();
  runMigrations();

  // Get available voices
  console.log('Available voices:');
  const voices = getAvailableVoices();
  console.log(voices);
  console.log();

  // Get a sample article
  const articles = ArticleModel.findAll(1);

  if (articles.length === 0) {
    console.log('❌ No articles found in database. Please add some feeds first.');
    return;
  }

  const article = articles[0];
  console.log(`Testing with article: "${article.title}"`);
  console.log(`Article ID: ${article.id}`);
  console.log();

  // Check if article has a summary
  if (!article.summary) {
    console.log('⚠️  Article does not have a summary yet.');
    console.log('Generating summary first...');

    const { generateArticleAnalysis } = await import('./services/aiService.js');
    const analysis = await generateArticleAnalysis(article.id);

    if (!analysis) {
      console.log('❌ Failed to generate summary');
      return;
    }

    console.log('✅ Summary generated');
    console.log();
  }

  // Test audio generation
  console.log('Generating audio summary...');
  console.log('This may take up to 30 seconds...');

  const startTime = Date.now();
  const result = await generateArticleAudio(article.id);
  const endTime = Date.now();

  if (!result) {
    console.log('❌ Audio generation failed');
    console.log('Make sure ELEVENLABS_API_KEY is set in .env file');
    return;
  }

  console.log();
  console.log('✅ Audio generated successfully!');
  console.log(`Audio URL: ${result.audioUrl}`);
  console.log(`Duration: ${result.duration} seconds`);
  console.log(`Generation time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
  console.log();

  // Test cached retrieval
  console.log('Testing cached audio retrieval...');
  const cachedStartTime = Date.now();
  const cachedResult = await generateArticleAudio(article.id);
  const cachedEndTime = Date.now();

  if (cachedResult) {
    console.log('✅ Cached audio retrieved successfully!');
    console.log(`Retrieval time: ${((cachedEndTime - cachedStartTime) / 1000).toFixed(2)}s`);
    console.log();
  }

  // Test with different voice
  console.log('Testing with different voice (Adam)...');
  const article2 = ArticleModel.findAll(2)[1];

  if (article2) {
    const adamResult = await generateArticleAudio(article2.id, 'pNInz6obpgDQGcFmaJgB');

    if (adamResult) {
      console.log('✅ Audio with Adam voice generated!');
      console.log(`Audio URL: ${adamResult.audioUrl}`);
      console.log();
    }
  }

  console.log('🎃 Audio generation test complete!');
}

testAudioGeneration().catch(console.error);
