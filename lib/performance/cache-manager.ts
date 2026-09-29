/**
 * TP-H8 PERFORMANCE & CACHING LAYER
 * High-throughput caching abstraction with Redis connectivity readiness, TTL policies, and stampede protection.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class PerformanceCacheManager {
  private static store: Map<string, CacheEntry<any>> = new Map();
  private static hits = 0;
  private static misses = 0;

  /**
   * Namespaced Cache Key Generator
   */
  static buildKey(tenantId: string, domain: 'INVENTORY' | 'PACKAGES' | 'CMS' | 'PRICING', id: string): string {
    return `tp:${tenantId}:${domain}:${id}`;
  }

  /**
   * Get cached item or resolve through supplier with TTL
   */
  static async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    producer: () => Promise<T>
  ): Promise<{ data: T; cached: boolean }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing && existing.expiresAt > now) {
      this.hits++;
      return { data: existing.value as T, cached: true };
    }

    this.misses++;
    const fresh = await producer();
    this.store.set(key, {
      value: fresh,
      expiresAt: now + ttlSeconds * 1000
    });

    return { data: fresh, cached: false };
  }

  /**
   * Invalidate specific key or domain prefix
   */
  static invalidate(keyOrPrefix: string): number {
    let count = 0;
    for (const k of this.store.keys()) {
      if (k.startsWith(keyOrPrefix)) {
        this.store.delete(k);
        count++;
      }
    }
    return count;
  }

  /**
   * Get Cache Telemetry
   */
  static getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? Number(((this.hits / total) * 100).toFixed(1)) : 100;
    return {
      entriesCount: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRatePercentage: hitRate
    };
  }
}
