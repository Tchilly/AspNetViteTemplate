// filepath: d:/Webdev/Tchilly/Template.Web/resources/js/composables/props.ts
/**
 * Utility for defining and using props in class-based components, inspired by Vue's defineProps.
 */
export class Props {
  /**
   * Used for type inference and default value declaration. Returns the default value.
   */
  static defineProps<T extends Record<string, any>>(defaults: T): T {
    return defaults;
  }

  /**
   * Returns a builder for a fluent API: useProps<T>().withDefaults(defaults)
   */
  static useProps<T extends Record<string, any>>(el: HTMLElement, defaults?: T): T | PropsBuilder<T> {
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
    return new PropsBuilder<T>(el);
  }
}

/**
 * Helper for defining props with optional cache support.
 */
export function defineProps<T extends Record<string, any>>(
  cache: any,
  defaults: T,
  cacheKey?: string,
  cacheOptions?: Record<string, any>
): T {
  if (cacheKey && cache && typeof cache.get === 'function' && typeof cache.set === 'function') {
    const cached = cache.get(cacheKey, cacheOptions);
    if (cached) return cached;
    cache.set(cacheKey, defaults, cacheOptions);
  }
  return defaults;
}

/**
 * Builder for fluent props usage: useProps<T>().withDefaults(defaults)
 */
export class PropsBuilder<T extends Record<string, any>> {
  private el: HTMLElement;
  constructor(el: HTMLElement) {
    this.el = el;
  }
  withDefaults(defaults: T): T {
    const propsString = this.el.dataset.props;
    try {
      if (propsString) {
        return { ...defaults, ...JSON.parse(propsString) };
      }
    } catch (error) {
      console.error("Error parsing data-props JSON:", error, propsString);
    }
    return defaults;
  }
}
