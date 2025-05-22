/**
 * Utility functions for defining and using props in class-based components, inspired by Vue's defineProps.
 *
 * - useProps<T>(el, defaults): Merges defaults with data-props from the element and returns the merged object.
 *   - If no data-props are present, returns the defaults.
 *   - If no defaults are provided, returns an empty object.
 * - defineProps<T>(defaults): Returns the defaults for type inference and declaration.
 *
 * Note: Fluent usage (withDefaults) is no longer supported. Always provide defaults directly if needed.
 */

export class Props {
  /**
   * Helper for defining props with optional cache support.
   * Returns the defaults for type inference and declaration. Optionally interacts with cache.
   *
   * @param cache - The cache service instance to use for storing/retrieving props.
   * @param defaults - The default props object for the component.
   * @param cacheKey - (Optional) The key to use for caching the props. If provided, enables caching.
   * @param cacheOptions - (Optional) Cache options:
   *   - ttl: Time to live (TTL) for the cache entry, in seconds. Determines how long the value will remain in the cache before expiring.
   *   - tag: Optional tag for group invalidation.
   *   - storage: Where to store the cache: 'memory', 'local', or 'cookie'.
   * @returns The default props object, possibly cached.
   */
  static defineProps<T extends Record<string, any>>(
    cache: any,
    defaults: T,
    cacheKey?: string,
    cacheOptions?: Record<string, any>
  ): T {
    if (cacheKey && cache && typeof cache.get === 'function' && typeof cache.set === 'function') {
      const cached = cache.get(cacheKey, cacheOptions);
      if (cached) return defaults;
      cache.set(cacheKey, defaults, cacheOptions);
    }
    return defaults;
  }

  /**
   * Used for type inference and default value declaration. Returns the default value.
   */
  static definePropsSimple<T extends Record<string, any>>(defaults: T): T {
    return defaults;
  }

  /**
   * Returns merged props from data-props and defaults, or just defaults if no data-props.
   */
  static useProps<T extends Record<string, any>>(el: HTMLElement, defaults?: T): T {
    if (defaults !== undefined) {
      const propsString = el.dataset.props;
      try {
        if (propsString) {
          return { ...defaults, ...JSON.parse(propsString) };
        }
      } catch (error) {
        console.error("Error parsing data-props JSON:", error, propsString);
      }
      return defaults;
    }
    // If no defaults provided, return empty object
    return {} as T;
  }
}
