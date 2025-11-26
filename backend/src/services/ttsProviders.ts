/**
 * TTS Provider abstraction layer
 * Supports multiple TTS providers with automatic fallback
 */

import axios from 'axios';
import { randomUUID } from 'crypto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

export type TTSProvider = 'elevenlabs' | 'openai' | 'google' | 'fallback';

interface TTSResult {
  audioPath: string;
  duration: number;
}

// Configuration
const TIMEOUT = 30000;
const AUDIO_STORAGE_DIR = './data/audio';

function ensureAudioDirectory(): void {
  if (!existsSync(AUDIO_STORAGE_DIR)) {
    mkdirSync(AUDIO_STORAGE_DIR, { recursive: true });
  }
}

function estimateDuration(text: string, speed: number = 1.0): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(((wordCount / 150) * 60) / speed);
}

/**
 * ElevenLabs Provider
 */
class ElevenLabsProvider {
  private readonly apiUrl = 'https://api.elevenlabs.io/v1';
  private readonly defaultVoice = '21m00Tcm4TlvDq8ikWAM'; // Rachel

  isAvailable(): boolean {
    return !!process.env.ELEVENLABS_API_KEY;
  }

  async generate(text: string, voiceId?: string, speed: number = 1.0): Promise<TTSResult> {
    ensureAudioDirectory();

    const response = await axios.post(
      `${this.apiUrl}/text-to-speech/${voiceId || this.defaultVoice}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: Math.max(0.5, Math.min(2.0, speed)),
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: TIMEOUT,
      }
    );

    const audioId = randomUUID();
    const audioFilename = `${audioId}.mp3`;
    const audioPath = join(AUDIO_STORAGE_DIR, audioFilename);

    writeFileSync(audioPath, Buffer.from(response.data));

    return {
      audioPath: `/audio/${audioFilename}`,
      duration: estimateDuration(text, speed),
    };
  }
}

/**
 * OpenAI TTS Provider
 */
class OpenAITTSProvider {
  private client: OpenAI | null = null;

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async generate(text: string, voice?: string, speed: number = 1.0): Promise<TTSResult> {
    ensureAudioDirectory();

    const client = this.getClient();
    const validVoice = voice || 'alloy'; // alloy, echo, fable, onyx, nova, shimmer

    const mp3 = await client.audio.speech.create({
      model: 'tts-1',
      voice: validVoice as any,
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)),
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    const audioId = randomUUID();
    const audioFilename = `${audioId}.mp3`;
    const audioPath = join(AUDIO_STORAGE_DIR, audioFilename);

    writeFileSync(audioPath, buffer);

    return {
      audioPath: `/audio/${audioFilename}`,
      duration: estimateDuration(text, speed),
    };
  }
}

/**
 * Google Cloud TTS Provider
 */
class GoogleTTSProvider {
  private readonly apiUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  isAvailable(): boolean {
    return !!process.env.GOOGLE_TTS_API_KEY;
  }

  async generate(text: string, voice?: string, speed: number = 1.0): Promise<TTSResult> {
    ensureAudioDirectory();

    const response = await axios.post(
      `${this.apiUrl}?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: voice || 'en-US-Neural2-C',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.25, Math.min(4.0, speed)),
        },
      },
      { timeout: TIMEOUT }
    );

    const audioContent = response.data.audioContent;
    const buffer = Buffer.from(audioContent, 'base64');

    const audioId = randomUUID();
    const audioFilename = `${audioId}.mp3`;
    const audioPath = join(AUDIO_STORAGE_DIR, audioFilename);

    writeFileSync(audioPath, buffer);

    return {
      audioPath: `/audio/${audioFilename}`,
      duration: estimateDuration(text, speed),
    };
  }
}

/**
 * Fallback Provider (returns null, client-side TTS will be used)
 */
class FallbackProvider {
  isAvailable(): boolean {
    return true;
  }

  async generate(_text: string, _voice?: string, _speed: number = 1.0): Promise<TTSResult | null> {
    console.log('No TTS provider available, client will use Web Speech API');
    return null;
  }
}

/**
 * TTS Provider Manager with automatic fallback
 */
export class TTSProviderManager {
  private providers: Map<TTSProvider, any>;
  private preferredOrder: TTSProvider[];

  constructor() {
    this.providers = new Map([
      ['elevenlabs', new ElevenLabsProvider()],
      ['openai', new OpenAITTSProvider()],
      ['google', new GoogleTTSProvider()],
      ['fallback', new FallbackProvider()],
    ]);

    // Set preferred order from env or use default
    const envOrder = process.env.TTS_PROVIDER_ORDER?.split(',') as TTSProvider[] | undefined;
    this.preferredOrder = envOrder || ['elevenlabs', 'openai', 'google', 'fallback'];
  }

  private getAvailableProvider(): any {
    for (const providerName of this.preferredOrder) {
      const provider = this.providers.get(providerName);
      if (provider && provider.isAvailable()) {
        console.log(`Using TTS provider: ${providerName}`);
        return provider;
      }
    }
    return this.providers.get('fallback');
  }

  async generateAudio(
    text: string,
    voice?: string,
    speed: number = 1.0
  ): Promise<TTSResult | null> {
    const provider = this.getAvailableProvider();

    try {
      return await provider.generate(text, voice, speed);
    } catch (error: any) {
      console.error('TTS provider error, trying fallback:', error.message);
      const fallback = this.providers.get('fallback')!;
      return await fallback.generate(text, voice, speed);
    }
  }

  getAvailableVoices(providerName?: TTSProvider): Record<string, string> {
    const provider = providerName || this.preferredOrder[0];

    switch (provider) {
      case 'elevenlabs':
        return {
          rachel: '21m00Tcm4TlvDq8ikWAM',
          adam: 'pNInz6obpgDQGcFmaJgB',
          bella: 'EXAVITQu4vr4xnSDxMaL',
          antoni: 'ErXwobaYiN019PkySvjV',
        };
      case 'openai':
        return {
          alloy: 'alloy',
          echo: 'echo',
          fable: 'fable',
          onyx: 'onyx',
          nova: 'nova',
          shimmer: 'shimmer',
        };
      case 'google':
        return {
          'neural2-c': 'en-US-Neural2-C',
          'neural2-d': 'en-US-Neural2-D',
          'neural2-f': 'en-US-Neural2-F',
          'neural2-g': 'en-US-Neural2-G',
        };
      default:
        return {};
    }
  }
}

// Export singleton instance
export const ttsProviderManager = new TTSProviderManager();
