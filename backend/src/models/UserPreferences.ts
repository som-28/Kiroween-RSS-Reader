import { db } from '../config/database.js';
import type { UserPreferences, UpdateUserPreferencesInput } from '../types/models.js';

// Helper to convert database row to UserPreferences object
function rowToUserPreferences(row: any): UserPreferences {
  return {
    id: row.id,
    interests: JSON.parse(row.interests),
    excludedTopics: JSON.parse(row.excluded_topics),
    preferredSources: JSON.parse(row.preferred_sources),
    digestFrequency: row.digest_frequency,
    digestTime: row.digest_time,
    digestArticleCount: row.digest_article_count,
    enableNotifications: Boolean(row.enable_notifications),
    notificationThreshold: row.notification_threshold,
    theme: row.theme,
    enableAnimations: Boolean(row.enable_animations),
    enableSoundEffects: Boolean(row.enable_sound_effects),
    summaryLength: row.summary_length,
    audioVoice: row.audio_voice,
    audioSpeed: row.audio_speed,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class UserPreferencesModel {
  // Get user preferences (default user)
  static get(): UserPreferences {
    const stmt = db.prepare('SELECT * FROM user_preferences WHERE id = ?');
    const row = stmt.get('default');
    if (!row) {
      throw new Error('Default user preferences not found');
    }
    return rowToUserPreferences(row);
  }

  // Update user preferences
  static update(input: UpdateUserPreferencesInput): UserPreferences {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.interests !== undefined) {
      updates.push('interests = ?');
      values.push(JSON.stringify(input.interests));
    }
    if (input.excludedTopics !== undefined) {
      updates.push('excluded_topics = ?');
      values.push(JSON.stringify(input.excludedTopics));
    }
    if (input.preferredSources !== undefined) {
      updates.push('preferred_sources = ?');
      values.push(JSON.stringify(input.preferredSources));
    }
    if (input.digestFrequency !== undefined) {
      updates.push('digest_frequency = ?');
      values.push(input.digestFrequency);
    }
    if (input.digestTime !== undefined) {
      updates.push('digest_time = ?');
      values.push(input.digestTime);
    }
    if (input.digestArticleCount !== undefined) {
      updates.push('digest_article_count = ?');
      values.push(input.digestArticleCount);
    }
    if (input.enableNotifications !== undefined) {
      updates.push('enable_notifications = ?');
      values.push(input.enableNotifications ? 1 : 0);
    }
    if (input.notificationThreshold !== undefined) {
      updates.push('notification_threshold = ?');
      values.push(input.notificationThreshold);
    }
    if (input.theme !== undefined) {
      updates.push('theme = ?');
      values.push(input.theme);
    }
    if (input.enableAnimations !== undefined) {
      updates.push('enable_animations = ?');
      values.push(input.enableAnimations ? 1 : 0);
    }
    if (input.enableSoundEffects !== undefined) {
      updates.push('enable_sound_effects = ?');
      values.push(input.enableSoundEffects ? 1 : 0);
    }
    if (input.summaryLength !== undefined) {
      updates.push('summary_length = ?');
      values.push(input.summaryLength);
    }
    if (input.audioVoice !== undefined) {
      updates.push('audio_voice = ?');
      values.push(input.audioVoice);
    }
    if (input.audioSpeed !== undefined) {
      updates.push('audio_speed = ?');
      values.push(input.audioSpeed);
    }

    if (updates.length === 0) return this.get();

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push('default');

    const stmt = db.prepare(`
      UPDATE user_preferences SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.get();
  }

  // Reset to defaults
  static reset(): UserPreferences {
    const stmt = db.prepare(`
      UPDATE user_preferences 
      SET 
        interests = '[]',
        excluded_topics = '[]',
        preferred_sources = '[]',
        digest_frequency = 'daily',
        digest_time = '09:00',
        digest_article_count = 10,
        enable_notifications = 1,
        notification_threshold = 0.7,
        theme = 'graveyard',
        enable_animations = 1,
        enable_sound_effects = 0,
        summary_length = 'medium',
        audio_voice = 'default',
        audio_speed = 1.0,
        updated_at = ?
      WHERE id = 'default'
    `);
    stmt.run(new Date().toISOString());
    return this.get();
  }
}
