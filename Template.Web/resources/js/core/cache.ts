/**
 * Cache library for storing and retrieving values with expiration and tagging support.
 *
 * This library provides a simple caching mechanism for storing and retrieving values.
 * It supports different storage types (memory, localStorage, sessionStorage) and allows for setting expiration times and tags for cache entries.
 */
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tag?: string; // Optional tag for group invalidation
  storage?: 'memory' | 'local'; // Where to store the cache
}

export type CacheDriverType = 'memory' | 'local' | 'session';

export interface ICacheDriver {
  set<T>(key: string, value: T, options?: CacheOptions): void;
  get<T>(key: string, options?: CacheOptions): T | undefined;
  invalidate(key: string, options?: CacheOptions): void;
  clear(): void;
}

class MapStorageAdapter implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, value); }
}

export abstract class AbstractCacheDriver implements ICacheDriver {
  abstract storage: Storage;
  set<T>(key: string, value: T, options?: CacheOptions) {
    const entry: any = { value };
    if (options?.ttl) entry.expiresAt = Date.now() + options.ttl;
    if (options?.tag) entry.tag = options.tag;
    this.storage.setItem(key, JSON.stringify(entry));
  }
  get<T>(key: string): T | undefined {
    const raw = this.storage.getItem(key);
    if (!raw) return undefined;
    try {
      const entry = JSON.parse(raw);
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.storage.removeItem(key);
        return undefined;
      }
      return entry.value;
    } catch {
      this.storage.removeItem(key);
      return undefined;
    }
  }
  invalidate(key: string) { this.storage.removeItem(key); }
  clear() { this.storage.clear(); }
}

export class MemoryCacheDriver extends AbstractCacheDriver {
  storage = new MapStorageAdapter();
}

export class LocalStorageCacheDriver extends AbstractCacheDriver {
  storage = window.localStorage;
}

export class SessionStorageCacheDriver extends AbstractCacheDriver {
  storage = window.sessionStorage;
}
