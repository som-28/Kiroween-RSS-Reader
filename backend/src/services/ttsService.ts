import { ttsProviderManager } from './ttsProviders.js';

/**
 * Generate audio from text using available TTS provider
 * @param text - The text to convert to speech
 * @param voiceId - The voice ID to use
 * @param speed - The speed multiplier (0.5 to 2.0)
 * @returns Promise with audio file path and duration
 */
export async function generateAudio(
  text: string,
  voiceId?: string,
  speed: number = 1.0
): Promise<{ audioPath: string; duration: number } | null> {
  try {
    console.log(`Generating audio for text (${text.length} chars)`);
    const result = await ttsProviderManager.generateAudio(text, voiceId, speed);

    if (!result) {
      console.log('No server-side TTS available, client will use Web Speech API');
      return null;
    }

    console.log(`Audio generated successfully: ${result.audioPath}`);
    return result;
  } catch (error: any) {
    console.error('Error generating audio:', error.message);
    return null;
  }
}

/**
 * Generate audio summary for an article
 * Uses the article's AI-generated summary as the text source
 * @param articleId - The article ID
 * @param voiceId - Optional voice ID (uses user preference or default)
 * @param speed - Optional speed multiplier (uses user preference or default)
 * @returns Promise with audio URL and duration
 */
export async function generateArticleAudio(
  articleId: string,
  voiceId?: string,
  speed?: number
): Promise<{ audioUrl: string; duration: number } | null> {
  try {
    const { ArticleModel } = await import('../models/Article.js');
    const { UserPreferencesModel } = await import('../models/UserPreferences.js');

    // Get article from database
    const article = ArticleModel.findById(articleId);
    if (!article) {
      console.error(`Article ${articleId} not found`);
      return null;
    }

    // Check if audio already exists (cached)
    if (article.audioUrl && article.audioDuration) {
      console.log(`Using cached audio for article ${articleId}`);
      return {
        audioUrl: article.audioUrl,
        duration: article.audioDuration,
      };
    }

    // Get user preferences for voice and speed
    const preferences = UserPreferencesModel.get();
    const selectedVoice = voiceId || preferences.audioVoice;
    const selectedSpeed = speed || preferences.audioSpeed || 1.0;

    // Use summary if available, otherwise use excerpt or truncated content
    const textToSpeak = article.summary || article.excerpt || article.content.substring(0, 500);

    if (!textToSpeak) {
      console.error(`No text available for audio generation for article ${articleId}`);
      return null;
    }

    console.log(`Generating audio for article ${articleId}`);

    // Generate audio
    const result = await generateAudio(textToSpeak, selectedVoice, selectedSpeed);

    if (!result) {
      return null;
    }

    // Update article in database with audio URL and duration
    ArticleModel.update(articleId, {
      audioUrl: result.audioPath,
      audioDuration: result.duration,
    });

    return {
      audioUrl: result.audioPath,
      duration: result.duration,
    };
  } catch (error: any) {
    console.error(`Error generating article audio for ${articleId}:`, error.message);
    return null;
  }
}

/**
 * Get available voices from current TTS provider
 * @returns Object with voice IDs and names
 */
export function getAvailableVoices(): Record<string, string> {
  return ttsProviderManager.getAvailableVoices();
}

/**
 * Validate voice ID
 * @param voiceId - The voice ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidVoice(voiceId: string): boolean {
  const voices = getAvailableVoices();
  return Object.values(voices).includes(voiceId);
}
