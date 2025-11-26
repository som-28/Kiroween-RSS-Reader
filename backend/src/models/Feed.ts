import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { Feed, CreateFeedInput, UpdateFeedInput } from '../types/models.js';

// Helper to convert database row to Feed object
function rowToFeed(row: any): Feed {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    lastFetched: row.last_fetched ? new Date(row.last_fetched) : null,
    fetchInterval: row.fetch_interval,
    status: row.status,
    errorMessage: row.error_message,
    articleCount: row.article_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class FeedModel {
  // Create a new feed
  static create(input: CreateFeedInput): Feed {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO feeds (id, url, title, description, fetch_interval, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.url,
      input.title,
      input.description || null,
      input.fetchInterval || 60,
      now,
      now
    );

    return this.findById(id)!;
  }

  // Find feed by ID
  static findById(id: string): Feed | null {
    const stmt = db.prepare('SELECT * FROM feeds WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToFeed(row) : null;
  }

  // Find feed by URL
  static findByUrl(url: string): Feed | null {
    const stmt = db.prepare('SELECT * FROM feeds WHERE url = ?');
    const row = stmt.get(url);
    return row ? rowToFeed(row) : null;
  }

  // Get all feeds
  static findAll(): Feed[] {
    const stmt = db.prepare('SELECT * FROM feeds ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(rowToFeed);
  }

  // Update feed
  static update(id: string, input: UpdateFeedInput): Feed | null {
    const feed = this.findById(id);
    if (!feed) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.fetchInterval !== undefined) {
      updates.push('fetch_interval = ?');
      values.push(input.fetchInterval);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.errorMessage !== undefined) {
      updates.push('error_message = ?');
      values.push(input.errorMessage);
    }
    if (input.lastFetched !== undefined) {
      updates.push('last_fetched = ?');
      values.push(input.lastFetched.toISOString());
    }
    if (input.articleCount !== undefined) {
      updates.push('article_count = ?');
      values.push(input.articleCount);
    }

    if (updates.length === 0) return feed;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE feeds SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  // Delete feed
  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM feeds WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get feeds by status
  static findByStatus(status: 'active' | 'error' | 'paused'): Feed[] {
    const stmt = db.prepare('SELECT * FROM feeds WHERE status = ? ORDER BY created_at DESC');
    const rows = stmt.all(status);
    return rows.map(rowToFeed);
  }

  // Increment article count
  static incrementArticleCount(id: string, increment: number = 1): void {
    const stmt = db.prepare(`
      UPDATE feeds 
      SET article_count = article_count + ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(increment, new Date().toISOString(), id);
  }
}
