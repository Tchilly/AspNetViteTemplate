import { Application } from "@/core/application";
import { Props, PropsBuilder, defineProps as definePropsHelper } from '@/core/props';
import { getOr } from '@/core/cache';

export abstract class BaseComponent {
  protected el: HTMLElement;
  protected app: Application;

  constructor(el: HTMLElement, app: Application) {
    this.el = el;
    this.app = app;
  }

  /**
   * Finds the first element that matches the specified selector string within the component's root element.
   * @param selector A DOMString containing one or more selectors to match.
   * @returns The first Element within the component's root element that matches the specified set of selectors, or null if no such element is found.
   */
  protected ref<T extends HTMLElement>(selector: string): T | null {
    return this.el.querySelector<T>(selector);
  }

  /**
   * Finds all elements that match the specified selector string within the component's root element.
   * @param selector A DOMString containing one or more selectors to match.
   * @returns A static (not live) NodeList representing a list of elements matching the specified group of selectors. Returns an empty NodeList if no matches are found.
   */
  protected refs<T extends HTMLElement>(selector: string): NodeListOf<T> {
    return this.el.querySelectorAll<T>(selector);
  }

  /**
   * Used for type inference and default value declaration. Returns the default value.
   * Optionally caches the result by key/tag/ttl using the injected cache service.
   * Warns if cache service is not set.
   */
  protected defineProps<T extends Record<string, any>>(defaults?: T, cacheKey?: string, cacheOptions?: Record<string, any>): T {
    // @ts-expect-error: cache is injected by convention in subclasses
    return Props.defineProps(this.cache, defaults, cacheKey, cacheOptions);
  }

  /**
   * Get a value from cache, or compute/store fallback if not present. Fallback can be a value or a function.
   */
  getOr<T>(key: string, fallback: T | (() => T), options?: Record<string, any>): T {
    // @ts-expect-error: cache is injected by convention in subclasses
    return getOr(this.cache, key, fallback, options);
  }

  /**
   * Reads and merges props from the DOM element's data-props attribute with defaults.
   * Supports both direct and fluent (withDefaults) usage.
   */
  protected useProps<T extends Record<string, any>>(defaults: T): T;
  protected useProps<T extends Record<string, any>>(): PropsBuilder<T>;
  protected useProps<T extends Record<string, any>>(defaults?: T): T | PropsBuilder<T> {
    if (defaults !== undefined) {
      return Props.useProps<T>(this.el, defaults);
    }
    return new PropsBuilder<T>(this.el);
  }
}
