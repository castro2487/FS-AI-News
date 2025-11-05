/**
 * Summary Cache Service
 * In-memory cache for AI-generated event summaries
 * Uses hash of public event fields as cache key
 */

import crypto from 'crypto';
import { PublicEvent } from '../models/Event';

interface CachedSummary {
  summary: string;
  timestamp: number;
}

class SummaryCache {
  private cache: Map<string, CachedSummary> = new Map();
  private readonly TTL = 3600000; // 1 hour in milliseconds

  /**
   * Generate cache key from public event fields
   */
  private generateCacheKey(event: PublicEvent): string {
    // Hash based on fields that affect summary: title, location, startAt, endAt
    const data = `${event.title}|${event.location}|${event.startAt}|${event.endAt}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached summary
   */
  get(event: PublicEvent): string | null {
    const key = this.generateCacheKey(event);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.summary;
  }

  /**
   * Set cached summary
   */
  set(event: PublicEvent, summary: string): void {
    const key = this.generateCacheKey(event);
    this.cache.set(key, {
      summary,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache for event (when event is updated)
   */
  invalidate(event: PublicEvent): void {
    const key = this.generateCacheKey(event);
    this.cache.delete(key);
  }

  /**
   * Clear all cache (for testing)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const summaryCache = new SummaryCache();
