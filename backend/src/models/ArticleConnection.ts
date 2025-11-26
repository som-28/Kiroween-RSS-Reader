import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { ArticleConnection, CreateArticleConnectionInput } from '../types/models.js';

// Helper to convert database row to ArticleConnection object
function rowToArticleConnection(row: any): ArticleConnection {
  return {
    id: row.id,
    article1Id: row.article1_id,
    article2Id: row.article2_id,
    connectionType: row.connection_type,
    strength: row.strength,
    sharedElements: JSON.parse(row.shared_elements),
    createdAt: new Date(row.created_at),
  };
}

export class ArticleConnectionModel {
  // Create a new article connection
  static create(input: CreateArticleConnectionInput): ArticleConnection {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO article_connections (
        id, article1_id, article2_id, connection_type, 
        strength, shared_elements, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.article1Id,
      input.article2Id,
      input.connectionType,
      input.strength,
      JSON.stringify(input.sharedElements),
      now
    );

    return this.findById(id)!;
  }

  // Find connection by ID
  static findById(id: string): ArticleConnection | null {
    const stmt = db.prepare('SELECT * FROM article_connections WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToArticleConnection(row) : null;
  }

  // Get all connections for an article
  static findByArticleId(articleId: string, minStrength?: number): ArticleConnection[] {
    let query = `
      SELECT * FROM article_connections 
      WHERE (article1_id = ? OR article2_id = ?)
    `;
    const params: any[] = [articleId, articleId];

    if (minStrength !== undefined) {
      query += ' AND strength >= ?';
      params.push(minStrength);
    }

    query += ' ORDER BY strength DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(rowToArticleConnection);
  }

  // Get connections between two specific articles
  static findBetweenArticles(article1Id: string, article2Id: string): ArticleConnection[] {
    const stmt = db.prepare(`
      SELECT * FROM article_connections 
      WHERE (article1_id = ? AND article2_id = ?) 
         OR (article1_id = ? AND article2_id = ?)
      ORDER BY strength DESC
    `);
    const rows = stmt.all(article1Id, article2Id, article2Id, article1Id);
    return rows.map(rowToArticleConnection);
  }

  // Get connections by type
  static findByType(
    connectionType: 'topic' | 'entity' | 'semantic',
    minStrength?: number,
    limit?: number
  ): ArticleConnection[] {
    let query = 'SELECT * FROM article_connections WHERE connection_type = ?';
    const params: any[] = [connectionType];

    if (minStrength !== undefined) {
      query += ' AND strength >= ?';
      params.push(minStrength);
    }

    query += ' ORDER BY strength DESC';

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(rowToArticleConnection);
  }

  // Delete connection
  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM article_connections WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Delete all connections for an article
  static deleteByArticleId(articleId: string): number {
    const stmt = db.prepare(`
      DELETE FROM article_connections 
      WHERE article1_id = ? OR article2_id = ?
    `);
    const result = stmt.run(articleId, articleId);
    return result.changes;
  }

  // Delete weak connections (below threshold)
  static deleteWeakConnections(strengthThreshold: number): number {
    const stmt = db.prepare('DELETE FROM article_connections WHERE strength < ?');
    const result = stmt.run(strengthThreshold);
    return result.changes;
  }

  // Check if connection exists
  static exists(article1Id: string, article2Id: string): boolean {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM article_connections 
      WHERE (article1_id = ? AND article2_id = ?) 
         OR (article1_id = ? AND article2_id = ?)
    `);
    const result = stmt.get(article1Id, article2Id, article2Id, article1Id) as { count: number };
    return result.count > 0;
  }

  // Count connections
  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM article_connections');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  // Get strongest connections
  static findStrongest(limit: number = 10): ArticleConnection[] {
    const stmt = db.prepare(`
      SELECT * FROM article_connections 
      ORDER BY strength DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows.map(rowToArticleConnection);
  }
}
