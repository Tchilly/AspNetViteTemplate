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

export class CacheService {
  private driver: ICacheDriver;
  private defaultOptions: CacheOptions;
  constructor(driver: ICacheDriver, defaultOptions: CacheOptions = {}) {
    this.driver = driver;
    this.defaultOptions = defaultOptions;
  }
  set(key: string, value: any, options?: CacheOptions) {
    this.driver.set(key, value, { ...this.defaultOptions, ...options });
  }
  get(key: string, fallback?: any, options?: CacheOptions): any {
    let value = this.driver.get(key, { ...this.defaultOptions, ...options });
    if (typeof value !== 'undefined' && value !== null) return value;
    if (typeof fallback === 'function') {
      value = fallback();
    } else if (typeof fallback !== 'undefined') {
      value = fallback;
    }
    if (typeof value !== 'undefined') {
      this.driver.set(key, value, { ...this.defaultOptions, ...options });
      return value;
    }
    return value; // will be undefined if no fallback
  }
  invalidate(key: string, options?: CacheOptions) {
    this.driver.invalidate(key, { ...this.defaultOptions, ...options });
  }
  clear() {
    this.driver.clear();
  }
}

/**
 * Get a value from cache, or compute/store fallback if not present. Fallback can be a value or a function.
 */
export function getOr<T>(cache: CacheService, key: string, fallback: T | (() => T), options?: Record<string, any>): T {
  let value = cache.get(key, options);
  if (typeof value !== 'undefined' && value !== null) return value as T;
  value = typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  cache.set(key, value, options);
  return value as T;
}
