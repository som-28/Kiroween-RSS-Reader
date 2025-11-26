import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { Article, CreateArticleInput, UpdateArticleInput } from '../types/models.js';

// Helper to convert database row to Article object
function rowToArticle(row: any): Article {
  return {
    id: row.id,
    feedId: row.feed_id,
    title: row.title,
    link: row.link,
    content: row.content,
    excerpt: row.excerpt,
    author: row.author,
    publishedAt: new Date(row.published_at),
    fetchedAt: new Date(row.fetched_at),
    summary: row.summary,
    topics: row.topics ? JSON.parse(row.topics) : [],
    entities: row.entities ? JSON.parse(row.entities) : [],
    sentiment: row.sentiment,
    relevanceScore: row.relevance_score,
    embedding: row.embedding ? JSON.parse(row.embedding) : null,
    isRead: Boolean(row.is_read),
    isFavorite: Boolean(row.is_favorite),
    userFeedback: row.user_feedback,
    audioUrl: row.audio_url,
    audioDuration: row.audio_duration,
  };
}

export class ArticleModel {
  // Create a new article
  static create(input: CreateArticleInput): Article {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO articles (
        id, feed_id, title, link, content, excerpt, author, 
        published_at, fetched_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.feedId,
      input.title,
      input.link,
      input.content,
      input.excerpt || null,
      input.author || null,
      input.publishedAt.toISOString(),
      now
    );

    return this.findById(id)!;
  }

  // Find article by ID
  static findById(id: string): Article | null {
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToArticle(row) : null;
  }

  // Find article by link
  static findByLink(link: string): Article | null {
    const stmt = db.prepare('SELECT * FROM articles WHERE link = ?');
    const row = stmt.get(link);
    return row ? rowToArticle(row) : null;
  }

  // Get all articles
  static findAll(limit?: number, offset?: number): Article[] {
    let query = 'SELECT * FROM articles ORDER BY published_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }
    const stmt = db.prepare(query);
    const rows = stmt.all();
    return rows.map(rowToArticle);
  }

  // Get articles by feed ID
  static findByFeedId(feedId: string, limit?: number): Article[] {
    let query = 'SELECT * FROM articles WHERE feed_id = ? ORDER BY published_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    const rows = stmt.all(feedId);
    return rows.map(rowToArticle);
  }

  // Update article
  static update(id: string, input: UpdateArticleInput): Article | null {
    const article = this.findById(id);
    if (!article) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.summary !== undefined) {
      updates.push('summary = ?');
      values.push(input.summary);
    }
    if (input.topics !== undefined) {
      updates.push('topics = ?');
      values.push(JSON.stringify(input.topics));
    }
    if (input.entities !== undefined) {
      updates.push('entities = ?');
      values.push(JSON.stringify(input.entities));
    }
    if (input.sentiment !== undefined) {
      updates.push('sentiment = ?');
      values.push(input.sentiment);
    }
    if (input.relevanceScore !== undefined) {
      updates.push('relevance_score = ?');
      values.push(input.relevanceScore);
    }
    if (input.embedding !== undefined) {
      updates.push('embedding = ?');
      values.push(JSON.stringify(input.embedding));
    }
    if (input.isRead !== undefined) {
      updates.push('is_read = ?');
      values.push(input.isRead ? 1 : 0);
    }
    if (input.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      values.push(input.isFavorite ? 1 : 0);
    }
    if (input.userFeedback !== undefined) {
      updates.push('user_feedback = ?');
      values.push(input.userFeedback);
    }
    if (input.audioUrl !== undefined) {
      updates.push('audio_url = ?');
      values.push(input.audioUrl);
    }
    if (input.audioDuration !== undefined) {
      updates.push('audio_duration = ?');
      values.push(input.audioDuration);
    }

    if (updates.length === 0) return article;

    values.push(id);

    const stmt = db.prepare(`
      UPDATE articles SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  // Delete article
  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get articles by relevance score
  static findByRelevanceScore(minScore: number, limit?: number): Article[] {
    let query =
      'SELECT * FROM articles WHERE relevance_score >= ? ORDER BY relevance_score DESC, published_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    const rows = stmt.all(minScore);
    return rows.map(rowToArticle);
  }

  // Get unread articles
  static findUnread(limit?: number): Article[] {
    let query = 'SELECT * FROM articles WHERE is_read = 0 ORDER BY published_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    const rows = stmt.all();
    return rows.map(rowToArticle);
  }

  // Get favorite articles
  static findFavorites(limit?: number): Article[] {
    let query = 'SELECT * FROM articles WHERE is_favorite = 1 ORDER BY published_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    const rows = stmt.all();
    return rows.map(rowToArticle);
  }

  // Search articles
  static search(query: string, limit?: number): Article[] {
    const searchQuery = `%${query}%`;
    let sql = `
      SELECT * FROM articles 
      WHERE title LIKE ? OR content LIKE ? OR summary LIKE ?
      ORDER BY published_at DESC
    `;
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(sql);
    const rows = stmt.all(searchQuery, searchQuery, searchQuery);
    return rows.map(rowToArticle);
  }

  // Get articles by date range
  static findByDateRange(startDate: Date, endDate: Date): Article[] {
    const stmt = db.prepare(`
      SELECT * FROM articles 
      WHERE published_at BETWEEN ? AND ?
      ORDER BY published_at DESC
    `);
    const rows = stmt.all(startDate.toISOString(), endDate.toISOString());
    return rows.map(rowToArticle);
  }

  // Count articles
  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM articles');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  // Count articles by feed
  static countByFeed(feedId: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM articles WHERE feed_id = ?');
    const result = stmt.get(feedId) as { count: number };
    return result.count;
  }
}
