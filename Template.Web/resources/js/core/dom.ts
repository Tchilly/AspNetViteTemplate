export interface DomElement {
  el: Element | null;
  find: (selector: string) => DomCollection;
  on: (event: string, callback: EventListener) => DomElement;
  off: (event: string, callback: EventListener) => DomElement;
  addClass: (className: string) => DomElement;
  removeClass: (className: string) => DomElement;
  toggleClass: (className: string) => DomElement;
  hasClass: (className: string) => boolean;
  attr: (name: string, value?: string) => string | DomElement;
  data: (key: string, value?: any) => any | DomElement;
  html: (content?: string) => string | DomElement;
  text: (content?: string) => string | DomElement;
  val: (value?: string) => string | DomElement;
  css: (property: string, value?: string) => string | DomElement;
  show: () => DomElement;
  hide: () => DomElement;
  toggle: () => DomElement;
}

export interface DomCollection {
  elements: Element[];
  each: (callback: (el: DomElement, index: number) => void) => DomCollection;
  find: (selector: string) => DomCollection;
  on: (event: string, callback: EventListener) => DomCollection;
  off: (event: string, callback: EventListener) => DomCollection;
  addClass: (className: string) => DomCollection;
  removeClass: (className: string) => DomCollection;
}

/**
 * Create a DomElement from a selector or HTML element
 */
function createDomElement(element: Element | null): DomElement {
  const domElement: DomElement = {
    el: element,

    find(selector: string): DomCollection {
      if (!this.el) return createDomCollection([]);
      return createDomCollection(Array.from(this.el.querySelectorAll(selector)));
    },

    on(event: string, callback: EventListener): DomElement {
      if (this.el) this.el.addEventListener(event, callback);
      return this;
    },

    off(event: string, callback: EventListener): DomElement {
      if (this.el) this.el.removeEventListener(event, callback);
      return this;
    },

    addClass(className: string): DomElement {
      if (this.el instanceof HTMLElement) this.el.classList.add(className);
      return this;
    },

    removeClass(className: string): DomElement {
      if (this.el instanceof HTMLElement) this.el.classList.remove(className);
      return this;
    },

    toggleClass(className: string): DomElement {
      if (this.el instanceof HTMLElement) this.el.classList.toggle(className);
      return this;
    },

    hasClass(className: string): boolean {
      return this.el instanceof HTMLElement ? this.el.classList.contains(className) : false;
    },

    attr(name: string, value?: string): string | DomElement {
      if (!this.el) return this;

      if (value === undefined) {
        return this.el instanceof HTMLElement ? this.el.getAttribute(name) || '' : '';
      }

      if (this.el instanceof HTMLElement) this.el.setAttribute(name, value);
      return this;
    },

    data(key: string, value?: any): any | DomElement {
      if (!this.el || !(this.el instanceof HTMLElement)) return value === undefined ? null : this;

      if (value === undefined) {
        return this.el.dataset[key];
      }

      this.el.dataset[key] = value;
      return this;
    },

    html(content?: string): string | DomElement {
      if (!this.el) return content === undefined ? '' : this;

      if (content === undefined) {
        return this.el.innerHTML;
      }

      this.el.innerHTML = content;
      return this;
    },

    text(content?: string): string | DomElement {
      if (!this.el) return content === undefined ? '' : this;

      if (content === undefined) {
        return this.el.textContent || '';
      }

      this.el.textContent = content;
      return this;
    },

    val(value?: string): string | DomElement {
      if (!this.el || !(this.el instanceof HTMLInputElement)) {
        return value === undefined ? '' : this;
      }

      if (value === undefined) {
        return this.el.value;
      }

      this.el.value = value;
      return this;
    },

    css(property: string, value?: string): string | DomElement {
      if (!this.el || !(this.el instanceof HTMLElement)) {
        return value === undefined ? '' : this;
      }

      if (value === undefined) {
        return window.getComputedStyle(this.el).getPropertyValue(property);
      }

      this.el.style.setProperty(property, value);
      return this;
    },

    show(): DomElement {
      if (this.el instanceof HTMLElement) this.el.style.display = '';
      return this;
    },

    hide(): DomElement {
      if (this.el instanceof HTMLElement) this.el.style.display = 'none';
      return this;
    },

    toggle(): DomElement {
      if (!(this.el instanceof HTMLElement)) return this;

      const display = window.getComputedStyle(this.el).display;
      this.el.style.display = display === 'none' ? '' : 'none';
      return this;
    }
  };

  return domElement;
}

/**
 * Create a collection of DOM elements
 */
function createDomCollection(elements: Element[]): DomCollection {
  const collection: DomCollection = {
    elements,

    each(callback: (el: DomElement, index: number) => void): DomCollection {
      this.elements.forEach((element, index) => {
        callback(createDomElement(element), index);
      });
      return this;
    },

    find(selector: string): DomCollection {
      const results: Element[] = [];
      this.elements.forEach(element => {
        results.push(...Array.from(element.querySelectorAll(selector)));
      });
      return createDomCollection(results);
    },

    on(event: string, callback: EventListener): DomCollection {
      this.elements.forEach(element => {
        element.addEventListener(event, callback);
      });
      return this;
    },

    off(event: string, callback: EventListener): DomCollection {
      this.elements.forEach(element => {
        element.removeEventListener(event, callback);
      });
      return this;
    },

    addClass(className: string): DomCollection {
      this.elements.forEach(element => {
        if (element instanceof HTMLElement) element.classList.add(className);
      });
      return this;
    },

    removeClass(className: string): DomCollection {
      this.elements.forEach(element => {
        if (element instanceof HTMLElement) element.classList.remove(className);
      });
      return this;
    }
  };

  return collection;
}

/**
 * jQuery-style selector function
 */
export function $(selector: string | Element | Document | Window | null): DomElement | DomCollection {
  if (typeof selector === 'string') {
    // Handle ID selector
    if (selector.startsWith('#')) {
      return createDomElement(document.getElementById(selector.substring(1)));
    }

    // Handle other selectors (class, tag, attribute)
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.length === 1 ? createDomElement(elements[0]) : createDomCollection(elements);
  }

  // Handle DOM element
  return createDomElement(selector as Element);
}

/**
 * Mixin function to add DOM utilities to a controller
 */
export function useDom<T extends { el: HTMLElement }>(instance: T): T & { $: typeof $ } {
  return Object.assign(instance, {
    $: (selector: string | Element | Document | Window | null) => {
      // If selector is a string, search within the controller's element
      if (typeof selector === 'string') {
        // Handle ID selector globally
        if (selector.startsWith('#')) {
          return createDomElement(document.getElementById(selector.substring(1)));
        }

        // Handle relative selection within the controller's element
        const elements = Array.from(instance.el.querySelectorAll(selector));
        return elements.length === 1 ? createDomElement(elements[0]) : createDomCollection(elements);
      }

      // If no selector or element is passed, return the controller's element
      if (!selector) {
        return createDomElement(instance.el);
      }

      // Handle DOM element
      if (selector instanceof Element) {
        return createDomElement(selector);
      }

      // Return empty DOM element for Document and Window
      return createDomElement(null);
    }
  });
}

// Document ready function
export function ready(callback: () => void): void {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

// Export default $ for convenience
export default $;
