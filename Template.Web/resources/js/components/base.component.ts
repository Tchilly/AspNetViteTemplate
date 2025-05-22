import { Application } from "@/core/application";
import { Props } from '@/core/props';

export abstract class BaseComponent {
  protected el: HTMLElement;
  protected app: Application;

  constructor(el: HTMLElement, app: Application) {
    this.el = el;
    this.app = app;
  }

  /**
   * Finds the first element that matches the specified selector string within the component's root element.
   * Adds a convenience `.on` method for event binding, similar to jQuery/DOMWrapper.
   * @param selector A DOMString containing one or more selectors to match.
   * @returns The first Element within the component's root element that matches the specified set of selectors, or null if no such element is found.
   */
  protected ref<T extends HTMLElement>(selector: string): (T & { on?: (event: string, handler: EventListenerOrEventListenerObject) => T }) | null {
    const el = this.el.querySelector<T>(selector);
    if (el) {
      // Attach a convenience 'on' method if not already present
      if (!(el as any).on) {
        (el as any).on = function(event: string, handler: EventListenerOrEventListenerObject) {
          this.addEventListener(event, handler);
          return this;
        };
      }
    }
    return el as any;
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
   * Reads and merges props from the DOM element's data-props attribute with defaults.
   * Usage: this.useProps<T>({ key: 'value' })
   */
  protected useProps<T extends Record<string, any>>(defaults?: T): T {
    return Props.useProps(this.el, defaults);
  }
}
