import { db } from '../config/database.js';
import { randomUUID } from 'crypto';

export interface PreferenceWeight {
  id: string;
  topic: string;
  weight: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to convert database row to PreferenceWeight object
function rowToPreferenceWeight(row: any): PreferenceWeight {
  return {
    id: row.id,
    topic: row.topic,
    weight: row.weight,
    positiveFeedbackCount: row.positive_feedback_count,
    negativeFeedbackCount: row.negative_feedback_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class PreferenceWeightModel {
  // Get weight for a topic
  static getByTopic(topic: string): PreferenceWeight | null {
    const stmt = db.prepare('SELECT * FROM preference_weights WHERE topic = ?');
    const row = stmt.get(topic.toLowerCase());
    return row ? rowToPreferenceWeight(row) : null;
  }

  // Get all weights
  static getAll(): PreferenceWeight[] {
    const stmt = db.prepare('SELECT * FROM preference_weights ORDER BY weight DESC');
    const rows = stmt.all();
    return rows.map(rowToPreferenceWeight);
  }

  // Create or update weight for a topic
  static upsert(topic: string, weightDelta: number, isPositive: boolean): PreferenceWeight {
    const normalizedTopic = topic.toLowerCase();
    const existing = this.getByTopic(normalizedTopic);

    if (existing) {
      // Update existing weight
      const newWeight = Math.max(0.1, Math.min(2.0, existing.weight + weightDelta));
      const positiveFeedbackCount = isPositive
        ? existing.positiveFeedbackCount + 1
        : existing.positiveFeedbackCount;
      const negativeFeedbackCount = !isPositive
        ? existing.negativeFeedbackCount + 1
        : existing.negativeFeedbackCount;

      const stmt = db.prepare(`
        UPDATE preference_weights 
        SET weight = ?, 
            positive_feedback_count = ?,
            negative_feedback_count = ?,
            updated_at = ?
        WHERE topic = ?
      `);

      stmt.run(
        newWeight,
        positiveFeedbackCount,
        negativeFeedbackCount,
        new Date().toISOString(),
        normalizedTopic
      );

      return this.getByTopic(normalizedTopic)!;
    } else {
      // Create new weight
      const id = randomUUID();
      const weight = 1.0 + weightDelta;
      const positiveFeedbackCount = isPositive ? 1 : 0;
      const negativeFeedbackCount = isPositive ? 0 : 1;

      const stmt = db.prepare(`
        INSERT INTO preference_weights (
          id, topic, weight, positive_feedback_count, negative_feedback_count
        )
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(id, normalizedTopic, weight, positiveFeedbackCount, negativeFeedbackCount);

      return this.getByTopic(normalizedTopic)!;
    }
  }

  // Get weight value for a topic (returns 1.0 if not found)
  static getWeight(topic: string): number {
    const weight = this.getByTopic(topic.toLowerCase());
    return weight ? weight.weight : 1.0;
  }

  // Reset all weights
  static resetAll(): void {
    db.prepare('DELETE FROM preference_weights').run();
  }
}
