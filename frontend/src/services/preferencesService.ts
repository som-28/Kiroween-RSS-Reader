import { apiClient } from '../lib/apiClient';

export interface UserPreferences {
  id: string;
  interests: string[];
  excludedTopics: string[];
  preferredSources: string[];
  digestFrequency: 'daily' | 'weekly' | 'off';
  digestTime: string;
  digestArticleCount: number;
  enableNotifications: boolean;
  notificationThreshold: number;
  theme: 'graveyard' | 'haunted-mansion' | 'witch-cottage';
  enableAnimations: boolean;
  enableSoundEffects: boolean;
  summaryLength: 'short' | 'medium' | 'long';
  audioVoice: string;
  audioSpeed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePreferencesInput {
  interests?: string[];
  excludedTopics?: string[];
  preferredSources?: string[];
  digestFrequency?: 'daily' | 'weekly' | 'off';
  digestTime?: string;
  digestArticleCount?: number;
  enableNotifications?: boolean;
  notificationThreshold?: number;
  theme?: 'graveyard' | 'haunted-mansion' | 'witch-cottage';
  enableAnimations?: boolean;
  enableSoundEffects?: boolean;
  summaryLength?: 'short' | 'medium' | 'long';
  audioVoice?: string;
  audioSpeed?: number;
}

class PreferencesService {
  private baseUrl = '/preferences';

  async getPreferences(): Promise<UserPreferences> {
    const data = await apiClient.get<{ preferences: UserPreferences }>(this.baseUrl);
    return {
      ...data.preferences,
      createdAt: new Date(data.preferences.createdAt),
      updatedAt: new Date(data.preferences.updatedAt),
    };
  }

  async updatePreferences(input: UpdatePreferencesInput): Promise<UserPreferences> {
    const data = await apiClient.put<{ preferences: UserPreferences }>(this.baseUrl, input);
    return {
      ...data.preferences,
      createdAt: new Date(data.preferences.createdAt),
      updatedAt: new Date(data.preferences.updatedAt),
    };
  }

  async resetPreferences(): Promise<UserPreferences> {
    const data = await apiClient.post<{ preferences: UserPreferences }>(`${this.baseUrl}/reset`);
    return {
      ...data.preferences,
      createdAt: new Date(data.preferences.createdAt),
      updatedAt: new Date(data.preferences.updatedAt),
    };
  }
}

export const preferencesService = new PreferencesService();
