import { db } from './database.js';

interface Migration {
  version: number;
  name: string;
  up: () => void;
}

// Create migrations table if it doesn't exist
function initMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Get current migration version
function getCurrentVersion(): number {
  const result = db.prepare('SELECT MAX(version) as version FROM migrations').get() as {
    version: number | null;
  };
  return result.version || 0;
}

// Record migration
function recordMigration(version: number, name: string) {
  db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(version, name);
}

// Define migrations
const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: () => {
      // This is handled by initializeDatabase() in database.ts
      // This migration is just a placeholder to track that initial schema was created
      console.log('✅ Migration 1: Initial schema already applied');
    },
  },
  {
    version: 2,
    name: 'add_preference_weights',
    up: () => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS preference_weights (
          id TEXT PRIMARY KEY,
          topic TEXT NOT NULL UNIQUE,
          weight REAL NOT NULL DEFAULT 1.0,
          positive_feedback_count INTEGER NOT NULL DEFAULT 0,
          negative_feedback_count INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created preference_weights table');
    },
  },
];

// Run pending migrations
export function runMigrations() {
  initMigrationsTable();
  const currentVersion = getCurrentVersion();

  const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('✅ All migrations up to date');
    return;
  }

  console.log(`📦 Running ${pendingMigrations.length} pending migration(s)...`);

  for (const migration of pendingMigrations) {
    try {
      console.log(`⚡ Applying migration ${migration.version}: ${migration.name}`);
      migration.up();
      recordMigration(migration.version, migration.name);
      console.log(`✅ Migration ${migration.version} applied successfully`);
    } catch (error) {
      console.error(`❌ Migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  console.log('✅ All migrations completed');
}

// Get migration status
export function getMigrationStatus() {
  initMigrationsTable();
  const currentVersion = getCurrentVersion();
  const appliedMigrations = db.prepare('SELECT * FROM migrations ORDER BY version').all();

  return {
    currentVersion,
    totalMigrations: migrations.length,
    appliedMigrations,
    pendingMigrations: migrations.filter((m) => m.version > currentVersion),
  };
}
