/**
 * AI Provider abstraction layer
 * Supports multiple AI providers with automatic fallback
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import type { Article } from '../types/models.js';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'fallback';

interface SummarizationResult {
  summary: string;
  topics: string[];
  entities: string[];
}

// Configuration
const TIMEOUT = 10000;
const MAX_SUMMARY_WORDS = 150;

/**
 * OpenAI Provider
 */
class OpenAIProvider {
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

  async summarize(article: Article): Promise<string> {
    const client = this.getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates concise summaries.' },
        {
          role: 'user',
          content: `Summarize in ${MAX_SUMMARY_WORDS} words:\n\n${article.title}\n\n${article.content.substring(0, 4000)}`,
        },
      ],
      max_tokens: 250,
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || '';
  }

  async extractTopics(article: Article): Promise<string[]> {
    const client = this.getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Extract 3-5 key topics as comma-separated list.' },
        { role: 'user', content: `${article.title}\n\n${article.content.substring(0, 3000)}` },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '';
    return text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
      .slice(0, 5);
  }

  async extractEntities(article: Article): Promise<string[]> {
    const client = this.getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Extract named entities as comma-separated list.' },
        { role: 'user', content: `${article.title}\n\n${article.content.substring(0, 3000)}` },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '';
    return text
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e)
      .slice(0, 10);
  }
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider {
  private client: Anthropic | null = null;

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this.client;
  }

  async summarize(article: Article): Promise<string> {
    const client = this.getClient();
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 250,
      messages: [
        {
          role: 'user',
          content: `Summarize this article in ${MAX_SUMMARY_WORDS} words:\n\n${article.title}\n\n${article.content.substring(0, 4000)}`,
        },
      ],
    });
    return message.content[0].type === 'text' ? message.content[0].text : '';
  }

  async extractTopics(article: Article): Promise<string[]> {
    const client = this.getClient();
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Extract 3-5 key topics from this article as a comma-separated list:\n\n${article.title}\n\n${article.content.substring(0, 3000)}`,
        },
      ],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
      .slice(0, 5);
  }

  async extractEntities(article: Article): Promise<string[]> {
    const client = this.getClient();
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Extract named entities from this article as a comma-separated list:\n\n${article.title}\n\n${article.content.substring(0, 3000)}`,
        },
      ],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return text
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e)
      .slice(0, 10);
  }
}

/**
 * Google Gemini Provider
 */
class GeminiProvider {
  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async summarize(article: Article): Promise<string> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Summarize this article in ${MAX_SUMMARY_WORDS} words:\n\n${article.title}\n\n${article.content.substring(0, 4000)}`,
              },
            ],
          },
        ],
      },
      { timeout: TIMEOUT }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async extractTopics(article: Article): Promise<string[]> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Extract 3-5 key topics from this article as a comma-separated list:\n\n${article.title}\n\n${article.content.substring(0, 3000)}`,
              },
            ],
          },
        ],
      },
      { timeout: TIMEOUT }
    );
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t)
      .slice(0, 5);
  }

  async extractEntities(article: Article): Promise<string[]> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Extract named entities from this article as a comma-separated list:\n\n${article.title}\n\n${article.content.substring(0, 3000)}`,
              },
            ],
          },
        ],
      },
      { timeout: TIMEOUT }
    );
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => e)
      .slice(0, 10);
  }
}

/**
 * Ollama (Local LLM) Provider
 */
class OllamaProvider {
  isAvailable(): boolean {
    return !!process.env.OLLAMA_BASE_URL;
  }

  private getBaseUrl(): string {
    return process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  private getModel(): string {
    return process.env.OLLAMA_MODEL || 'llama2';
  }

  async summarize(article: Article): Promise<string> {
    const response = await axios.post(
      `${this.getBaseUrl()}/api/generate`,
      {
        model: this.getModel(),
        prompt: `Summarize this article in ${MAX_SUMMARY_WORDS} words:\n\n${article.title}\n\n${article.content.substring(0, 4000)}`,
        stream: false,
      },
      { timeout: TIMEOUT }
    );
    return response.data.response || '';
  }

  async extractTopics(article: Article): Promise<string[]> {
    const response = await axios.post(
      `${this.getBaseUrl()}/api/generate`,
      {
        model: this.getModel(),
        prompt: `Extract 3-5 key topics from this article as a comma-separated list:\n\n${article.title}\n\n${article.content.substring(0, 3000)}`,
        stream: false,
      },
      { timeout: TIMEOUT }
    );
    const text = response.data.response || '';
    return text
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t)
      .slice(0, 5);
  }

  async extractEntities(article: Article): Promise<string[]> {
    const response = await axios.post(
      `${this.getBaseUrl()}/api/generate`,
      {
        model: this.getModel(),
        prompt: `Extract named entities from this article as a comma-separated list:\n\n${article.title}\n\n${article.content.substring(0, 3000)}`,
        stream: false,
      },
      { timeout: TIMEOUT }
    );
    const text = response.data.response || '';
    return text
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => e)
      .slice(0, 10);
  }
}

/**
 * Fallback Provider (simple text extraction)
 */
class FallbackProvider {
  isAvailable(): boolean {
    return true;
  }

  private stripHtml(html: string): string {
    // Remove HTML tags
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  async summarize(article: Article): Promise<string> {
    // Use excerpt or first 300 characters, strip HTML
    const text = article.excerpt || article.content;
    const cleaned = this.stripHtml(text);
    return cleaned.substring(0, 300) + (cleaned.length > 300 ? '...' : '');
  }

  async extractTopics(article: Article): Promise<string[]> {
    // Simple keyword extraction from title
    const words = article.title.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
    ]);
    return words.filter((w) => w.length > 4 && !stopWords.has(w)).slice(0, 5);
  }

  async extractEntities(article: Article): Promise<string[]> {
    // Extract capitalized words (simple NER)
    const cleaned = this.stripHtml(article.content);
    const matches = cleaned.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    return [...new Set(matches)].slice(0, 10);
  }
}

/**
 * AI Provider Manager with automatic fallback
 */
export class AIProviderManager {
  private providers: Map<AIProvider, any>;
  private preferredOrder: AIProvider[];

  constructor() {
    this.providers = new Map([
      ['openai', new OpenAIProvider()],
      ['anthropic', new AnthropicProvider()],
      ['gemini', new GeminiProvider()],
      ['ollama', new OllamaProvider()],
      ['fallback', new FallbackProvider()],
    ]);

    // Set preferred order from env or use default
    const envOrder = process.env.AI_PROVIDER_ORDER?.split(',') as AIProvider[] | undefined;
    this.preferredOrder = envOrder || ['openai', 'anthropic', 'gemini', 'ollama', 'fallback'];
  }

  private getAvailableProvider(): any {
    for (const providerName of this.preferredOrder) {
      const provider = this.providers.get(providerName);
      if (provider && provider.isAvailable()) {
        console.log(`Using AI provider: ${providerName}`);
        return provider;
      }
    }
    return this.providers.get('fallback');
  }

  async generateAnalysis(article: Article): Promise<SummarizationResult> {
    const provider = this.getAvailableProvider();

    try {
      const [summary, topics, entities] = await Promise.all([
        provider.summarize(article),
        provider.extractTopics(article),
        provider.extractEntities(article),
      ]);

      return { summary, topics, entities };
    } catch (error: any) {
      console.error('AI provider error, using fallback:', error.message);
      const fallback = this.providers.get('fallback')!;
      const [summary, topics, entities] = await Promise.all([
        fallback.summarize(article),
        fallback.extractTopics(article),
        fallback.extractEntities(article),
      ]);
      return { summary, topics, entities };
    }
  }
}

// Export singleton instance
export const aiProviderManager = new AIProviderManager();
