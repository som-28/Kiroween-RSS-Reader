import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { runMigrations } from './config/migrations.js';
import { initializeFeedScheduler } from './services/feedScheduler.js';
import { initializeDigestScheduler } from './services/digestScheduler.js';
import { initializeDemoContent } from './services/demoContent.js';
import feedRoutes from './routes/feeds.js';
import articleRoutes from './routes/articles.js';
import preferencesRoutes from './routes/preferences.js';
import topicsRoutes from './routes/topics.js';
import digestRoutes from './routes/digests.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notifications.js';
import demoRoutes from './routes/demo.js';

dotenv.config();

// Initialize database and run migrations
initializeDatabase();
runMigrations();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static audio files
app.use('/audio', express.static('./data/audio'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'alive', message: 'The haunted server is running! 👻' });
});

// Routes
app.use('/api/feeds', feedRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/digests', digestRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/demo', demoRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🎃 Haunted RSS Reader backend running on port ${PORT}`);

  // Initialize demo content if needed
  await initializeDemoContent();

  // Initialize feed scheduler after server starts
  initializeFeedScheduler();

  // Initialize digest scheduler after server starts
  initializeDigestScheduler();
});
