import { describe, it, expect, vi } from 'vitest';
import { validateFeedUrl } from './feedParser.js';

describe('Feed Parser', () => {
  describe('validateFeedUrl', () => {
    it('should accept valid HTTP URLs', async () => {
      // Mock the parser to avoid actual network calls
      vi.mock('rss-parser', () => ({
        default: class MockParser {
          async parseURL() {
            return { items: [] };
          }
        },
      }));

      const result = await validateFeedUrl('http://example.com/feed.xml');
      expect(result.isValid).toBe(true);
    });

    it('should accept valid HTTPS URLs', async () => {
      vi.mock('rss-parser', () => ({
        default: class MockParser {
          async parseURL() {
            return { items: [] };
          }
        },
      }));

      const result = await validateFeedUrl('https://example.com/feed.xml');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URL format', async () => {
      const result = await validateFeedUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid URL format');
    });

    it('should reject non-HTTP protocols', async () => {
      const result = await validateFeedUrl('ftp://example.com/feed.xml');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('HTTP or HTTPS protocol');
    });
  });
});
