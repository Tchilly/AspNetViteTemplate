import { Application } from "@/core/application";
import { Props } from '@/core/props';
import { Dom } from '@/core/dom';

export abstract class BaseComponent {
  protected el: HTMLElement;
  protected app: Application;
  protected dom: Dom;

  constructor(el: HTMLElement, app: Application) {
    this.el = el;
    this.app = app;
    this.dom = new Dom(el);
  }

  /**
   * Finds the first element that matches the specified selector string within the component's root element.
   * Adds all Dom methods as bound methods to the element, for chainable usage.
   * @param selector A DOMString containing one or more selectors to match.
   * @returns The first Element within the component's root element that matches the specified set of selectors, or null if no such element is found.
   */
  protected ref(selector: string): (HTMLElement & Partial<import('@/core/dom').DomChainableMethods>) | null {
    return this.dom.ref(selector);
  }

  /**
   * Finds all elements that match the specified selector string within the component's root element.
   * @param selector A DOMString containing one or more selectors to match.
   * @returns A static (not live) NodeList representing a list of elements matching the specified group of selectors. Returns an empty NodeList if no matches are found.
   */
  protected refs(selector: string): NodeListOf<HTMLElement> {
    return this.dom.refs(selector);
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
