import type { CacheOptions, ICacheDriver } from '@/core/cache';
import { MemoryCacheDriver, LocalStorageCacheDriver, SessionStorageCacheDriver, CookieCacheDriver } from '@/core/cache';

export class CacheService {
  private driver: ICacheDriver;
  private defaultOptions: CacheOptions;
  private drivers: Record<string, ICacheDriver>;
  constructor(driver: ICacheDriver, defaultOptions: CacheOptions = {}) {
    this.driver = driver;
    this.defaultOptions = defaultOptions;
    this.drivers = {
      memory: new MemoryCacheDriver(),
      local: new LocalStorageCacheDriver(),
      session: new SessionStorageCacheDriver(),
      cookie: new CookieCacheDriver(),
    };
  }
  private getDriver(options?: CacheOptions): ICacheDriver {
    if (options?.storage && this.drivers[options.storage]) {
      return this.drivers[options.storage];
    }
    return this.driver;
  }
  set(key: string, value: any, options?: CacheOptions) {
    this.getDriver(options).set(key, value, { ...this.defaultOptions, ...options });
  }
  get(key: string, fallback?: any, options?: CacheOptions): any {
    let value = this.getDriver(options).get(key, { ...this.defaultOptions, ...options });
    if (typeof value !== 'undefined' && value !== null) return value;
    if (typeof fallback === 'function') {
      value = fallback();
    } else if (typeof fallback !== 'undefined') {
      value = fallback;
    }
    if (typeof value !== 'undefined') {
      this.getDriver(options).set(key, value, { ...this.defaultOptions, ...options });
      return value;
    }
    return value; // will be undefined if no fallback
  }
  invalidate(key: string, options?: CacheOptions) {
    this.getDriver(options).invalidate(key, { ...this.defaultOptions, ...options });
  }
  clear(options?: CacheOptions) {
    this.getDriver(options).clear();
  }
}
