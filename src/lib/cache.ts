import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, Record<string, unknown>>({
  max: 100,
  ttl: 1000 * 60 * 10,
});

export function getCached<T extends Record<string, unknown>>(
  key: string
): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCache<T extends Record<string, unknown>>(
  key: string,
  value: T
): void {
  cache.set(key, value);
}

export function cacheKey(prefix: string, query: string): string {
  return `${prefix}:${query.toLowerCase().trim()}`;
}
