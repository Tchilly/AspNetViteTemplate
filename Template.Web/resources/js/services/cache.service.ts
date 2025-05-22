import type { CacheOptions, ICacheDriver } from '@/core/cache';

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
