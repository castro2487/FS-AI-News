import { generateCacheKey } from '../utils/hash';

export class CacheService {
  private cache: Map<string, string> = new Map();

  get(key: string): string | null {
    return this.cache.get(key) || null;
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  generateKey(data: Record<string, any>): string {
    return generateCacheKey(data);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}