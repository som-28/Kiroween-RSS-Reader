import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type BetterSqlite3 from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/haunted-rss.db');

// Initialize database connection
export const db: BetterSqlite3.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Feeds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      last_fetched DATETIME,
      fetch_interval INTEGER NOT NULL DEFAULT 60,
      status TEXT NOT NULL DEFAULT 'active',
      error_message TEXT,
      article_count INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Articles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      author TEXT,
      published_at DATETIME NOT NULL,
      fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      summary TEXT,
      topics TEXT,
      entities TEXT,
      sentiment TEXT,
      relevance_score REAL NOT NULL DEFAULT 0,
      embedding TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      user_feedback TEXT,
      audio_url TEXT,
      audio_duration INTEGER,
      FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
    )
  `);

  // Create index on feed_id for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id)
  `);

  // Create index on published_at for sorting
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)
  `);

  // Create index on relevance_score for filtering
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_relevance_score ON articles(relevance_score DESC)
  `);

  // User preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      interests TEXT NOT NULL DEFAULT '[]',
      excluded_topics TEXT NOT NULL DEFAULT '[]',
      preferred_sources TEXT NOT NULL DEFAULT '[]',
      digest_frequency TEXT NOT NULL DEFAULT 'daily',
      digest_time TEXT NOT NULL DEFAULT '09:00',
      digest_article_count INTEGER NOT NULL DEFAULT 10,
      enable_notifications INTEGER NOT NULL DEFAULT 1,
      notification_threshold REAL NOT NULL DEFAULT 0.7,
      theme TEXT NOT NULL DEFAULT 'graveyard',
      enable_animations INTEGER NOT NULL DEFAULT 1,
      enable_sound_effects INTEGER NOT NULL DEFAULT 0,
      summary_length TEXT NOT NULL DEFAULT 'medium',
      audio_voice TEXT NOT NULL DEFAULT 'default',
      audio_speed REAL NOT NULL DEFAULT 1.0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Digests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS digests (
      id TEXT PRIMARY KEY,
      generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      period_start DATETIME NOT NULL,
      period_end DATETIME NOT NULL,
      article_ids TEXT NOT NULL,
      summary TEXT NOT NULL,
      top_topics TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  // Article connections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS article_connections (
      id TEXT PRIMARY KEY,
      article1_id TEXT NOT NULL,
      article2_id TEXT NOT NULL,
      connection_type TEXT NOT NULL,
      strength REAL NOT NULL,
      shared_elements TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article1_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (article2_id) REFERENCES articles(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for article connections
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_connections_article1 ON article_connections(article1_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_connections_article2 ON article_connections(article2_id)
  `);

  // Insert default user preferences if not exists
  const defaultPrefs = db.prepare('SELECT COUNT(*) as count FROM user_preferences').get() as {
    count: number;
  };
  if (defaultPrefs.count === 0) {
    db.prepare(
      `
      INSERT INTO user_preferences (id) VALUES ('default')
    `
    ).run();
  }

  console.log('✅ Database schema initialized');
}

export default db;
