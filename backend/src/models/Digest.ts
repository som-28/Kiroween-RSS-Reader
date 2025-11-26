import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { Digest, CreateDigestInput } from '../types/models.js';

// Helper to convert database row to Digest object
function rowToDigest(row: any): Digest {
  return {
    id: row.id,
    generatedAt: new Date(row.generated_at),
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    articleIds: JSON.parse(row.article_ids),
    summary: row.summary,
    topTopics: JSON.parse(row.top_topics),
    type: row.type,
  };
}

export class DigestModel {
  // Create a new digest
  static create(input: CreateDigestInput): Digest {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO digests (
        id, generated_at, period_start, period_end, 
        article_ids, summary, top_topics, type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      now,
      input.periodStart.toISOString(),
      input.periodEnd.toISOString(),
      JSON.stringify(input.articleIds),
      input.summary,
      JSON.stringify(input.topTopics),
      input.type
    );

    return this.findById(id)!;
  }

  // Find digest by ID
  static findById(id: string): Digest | null {
    const stmt = db.prepare('SELECT * FROM digests WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToDigest(row) : null;
  }

  // Get all digests
  static findAll(limit?: number): Digest[] {
    let query = 'SELECT * FROM digests ORDER BY generated_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    const rows = stmt.all();
    return rows.map(rowToDigest);
  }

  // Get latest digest
  static findLatest(): Digest | null {
    const stmt = db.prepare('SELECT * FROM digests ORDER BY generated_at DESC LIMIT 1');
    const row = stmt.get();
    return row ? rowToDigest(row) : null;
  }

  // Get digests by type
  static findByType(type: 'daily' | 'weekly' | 'custom', limit?: number): Digest[] {
    let query = 'SELECT * FROM digests WHERE type = ? ORDER BY generated_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    const rows = stmt.all(type);
    return rows.map(rowToDigest);
  }

  // Get digests by date range
  static findByDateRange(startDate: Date, endDate: Date): Digest[] {
    const stmt = db.prepare(`
      SELECT * FROM digests 
      WHERE generated_at BETWEEN ? AND ?
      ORDER BY generated_at DESC
    `);
    const rows = stmt.all(startDate.toISOString(), endDate.toISOString());
    return rows.map(rowToDigest);
  }

  // Delete digest
  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM digests WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Delete old digests (keep only last N)
  static deleteOldDigests(keepCount: number): number {
    const stmt = db.prepare(`
      DELETE FROM digests 
      WHERE id NOT IN (
        SELECT id FROM digests 
        ORDER BY generated_at DESC 
        LIMIT ?
      )
    `);
    const result = stmt.run(keepCount);
    return result.changes;
  }

  // Count digests
  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM digests');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}
