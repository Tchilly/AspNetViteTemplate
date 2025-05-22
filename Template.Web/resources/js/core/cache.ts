/**
 * Cache library for storing and retrieving values with expiration and tagging support.
 *
 * This library provides a simple caching mechanism for storing and retrieving values.
 * It supports different storage types (memory, localStorage, sessionStorage) and allows for setting expiration times and tags for cache entries.
 */
export interface CacheOptions {
  /**
   * Time to live (TTL) for the cache entry, in seconds.
   * Determines how long the value will remain in the cache before expiring.
   * For example, a value of 60 means the entry will expire after 60 seconds.
   */
  ttl?: number;
  /**
   * Optional tag for group invalidation.
   */
  tag?: string;
  /**
   * Where to store the cache: 'memory', 'local', or 'cookie'.
   */
  storage?: 'memory' | 'local' | 'cookie';
}

export type CacheDriverType = 'memory' | 'local' | 'session' | 'cookie';

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

class CookieStorageAdapter implements Storage {
  get length() {
    return document.cookie.split(';').filter(Boolean).length;
  }
  clear() {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const key = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (key) this.removeItem(key);
    });
  }
  getItem(key: string) {
    const name = encodeURIComponent(key) + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return decodeURIComponent(cookie.substring(name.length));
      }
    }
    return null;
  }
  key(index: number) {
    const cookies = document.cookie.split(';').filter(Boolean);
    if (index < 0 || index >= cookies.length) return null;
    const eqPos = cookies[index].indexOf('=');
    return eqPos > -1 ? decodeURIComponent(cookies[index].substr(0, eqPos).trim()) : null;
  }
  removeItem(key: string) {
    document.cookie = encodeURIComponent(key) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
  setItem(key: string, value: string) {
    // Try to extract expiresAt from the value (if present)
    let expires = '';
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.expiresAt) {
        // expiresAt is in ms since epoch (local time)
        const date = new Date(parsed.expiresAt);
        expires = '; expires=' + date.toString();
      }
    } catch {}
    document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + expires + '; path=/';
  }
}

export abstract class AbstractCacheDriver implements ICacheDriver {
  abstract storage: Storage;
  set<T>(key: string, value: T, options?: CacheOptions) {
    const entry: any = { value };
    if (options?.ttl) entry.expiresAt = Date.now() + options.ttl * 1000;
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

export class CookieCacheDriver extends AbstractCacheDriver {
  storage = new CookieStorageAdapter();
}
