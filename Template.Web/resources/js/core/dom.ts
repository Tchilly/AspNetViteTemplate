export class Dom {
  public elements: HTMLElement[];
  private root: HTMLElement;

  constructor(rootOrSelector: string | HTMLElement | HTMLElement[] | Dom) {
    if (rootOrSelector instanceof Dom) {
      this.elements = rootOrSelector.elements;
      this.root = this.elements[0] || document.body;
    } else if (rootOrSelector instanceof HTMLElement) {
      this.elements = [rootOrSelector];
      this.root = rootOrSelector;
    } else if (Array.isArray(rootOrSelector) && rootOrSelector.every(e => e instanceof HTMLElement)) {
      this.elements = rootOrSelector as HTMLElement[];
      this.root = this.elements[0] || document.body;
    } else if (typeof rootOrSelector === 'string') {
      if (rootOrSelector.trim().startsWith('<')) {
        const template = document.createElement('template');
        template.innerHTML = rootOrSelector.trim();
        this.elements = Array.from(template.content.childNodes).filter(
          node => node.nodeType === Node.ELEMENT_NODE
        ) as HTMLElement[];
        this.root = this.elements[0] || document.body;
      } else {
        this.elements = Array.from(document.querySelectorAll(rootOrSelector));
        this.root = this.elements[0] || document.body;
      }
    } else {
      this.elements = [];
      this.root = document.body;
    }
  }

  on(eventName: string, handler: EventListenerOrEventListenerObject): this {
    this.elements.forEach(el => el.addEventListener(eventName, handler));
    return this;
  }

  addClass(classNames: string): this {
    const classes = classNames.split(' ').filter(cls => cls.trim() !== '');
    this.elements.forEach(el => {
      el.classList.add(...classes);
    });
    return this;
  }

  removeClass(className: string): this {
    this.elements.forEach(el => el.classList.remove(className));
    return this;
  }

  toggleClass(className: string): this {
    this.elements.forEach(el => el.classList.toggle(className));
    return this;
  }

  text(): string;
  text(value: string): this;
  text(value?: string): string | this {
    if (value === undefined) {
      return this.elements.map(el => el.textContent || '').join('');
    }
    this.elements.forEach(el => el.textContent = value);
    return this;
  }

  html(): string;
  html(value: string): this;
  html(value?: string): string | this {
    if (value === undefined) {
      return this.elements[0] ? this.elements[0].innerHTML : '';
    }
    this.elements.forEach(el => el.innerHTML = value);
    return this;
  }

  append(child: string | HTMLElement | Dom): this {
    this.elements.forEach(el => {
      if (typeof child === 'string') {
        el.insertAdjacentHTML('beforeend', child);
      } else if (child instanceof HTMLElement) {
        el.appendChild(child);
      } else if (child instanceof Dom) {
        child.elements.forEach(childEl => el.appendChild(childEl));
      }
    });
    return this;
  }

  find(selector: string): Dom {
    const foundElements: HTMLElement[] = [];
    this.elements.forEach(el => {
      el.querySelectorAll(selector).forEach(foundEl => {
        if (foundEl instanceof HTMLElement) {
          foundElements.push(foundEl);
        }
      });
    });
    return new Dom(foundElements);
  }

  children(): Dom {
    const childElements: HTMLElement[] = [];
    this.elements.forEach(el => {
      childElements.push(...Array.from(el.children) as HTMLElement[]);
    });
    return new Dom(childElements);
  }

  parent(): Dom {
    const parentElements: HTMLElement[] = [];
    this.elements.forEach(el => {
      if (el.parentElement && !parentElements.includes(el.parentElement)) {
        parentElements.push(el.parentElement);
      }
    });
    return new Dom(parentElements);
  }

  // Remove overloads for attr, use a single implementation
  attr(name: string, value?: string): string | this {
    if (typeof value === 'undefined') {
      return this.elements[0] ? this.elements[0].getAttribute(name) ?? '' : '';
    }
    this.elements.forEach(el => el.setAttribute(name, value));
    return this;
  }

  removeAttr(name: string): this {
    this.elements.forEach(el => el.removeAttribute(name));
    return this;
  }

  val(): string;
  val(value: string): this;
  val(value?: string): string | this {
    if (value === undefined) {
      const firstEl = this.elements[0] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
      return firstEl ? firstEl.value : '';
    }
    this.elements.forEach(el => {
      (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement).value = value;
    });
    return this;
  }

  css(property: string | Record<string, string>, value?: string): this {
    if (typeof property === 'string' && value !== undefined) {
      this.elements.forEach(el => el.style.setProperty(property, value));
    } else if (typeof property === 'object') {
      this.elements.forEach(el => {
        Object.keys(property).forEach(key => {
          el.style.setProperty(key, property[key]);
        });
      });
    }
    return this;
  }

  each(callback: (element: HTMLElement, index: number) => void): this {
    this.elements.forEach((el, index) => callback(el, index));
    return this;
  }

  get(index: number): HTMLElement | undefined {
    return this.elements[index];
  }

  first(): Dom {
    return new Dom(this.elements[0] ? [this.elements[0]] : []);
  }

  hide(): this {
    this.elements.forEach(el => el.style.display = 'none');
    return this;
  }

  show(): this {
    this.elements.forEach(el => el.style.display = '');
    return this;
  }

  /**
   * Finds the first element matching the selector within the root.
   * Adds all Dom methods as bound methods to the element, for chainable usage.
   */
  ref(selector: string): (HTMLElement & Partial<DomChainableMethods>) | null {
    const el = this.root.querySelector(selector) as HTMLElement | null;
    if (el) {
      const dom = new Dom(el);
      const methodMap: Partial<DomChainableMethods> = {
        on: (event, handler) => { dom.on(event, handler); return el; },
        addClass: (classNames) => { dom.addClass(classNames); return el; },
        removeClass: (className) => { dom.removeClass(className); return el; },
        toggleClass: (className) => { dom.toggleClass(className); return el; },
        text: (value?) => {
          if (typeof value === 'undefined') return dom.text();
          dom.text(value);
          return el;
        },
        html: (value?) => {
          if (typeof value === 'undefined') return dom.html();
          dom.html(value);
          return el;
        },
        append: (child) => { dom.append(child); return el; },
        find: (selector) => {
          const found = dom.find(selector);
          return found.elements[0] || null;
        },
        children: () => {
          const children = dom.children();
          return children.elements[0] || null;
        },
        parent: () => {
          const parent = dom.parent();
          return parent.elements[0] || null;
        },
        attr: (name, value?) => {
          if (typeof value === 'undefined') return dom.attr(name);
          dom.attr(name, value);
          return el;
        },
        removeAttr: (name) => { dom.removeAttr(name); return el; },
        val: (value?) => {
          if (typeof value === 'undefined') return dom.val();
          dom.val(value);
          return el;
        },
        css: (property, value?) => { dom.css(property as any, value); return el; },
        each: (callback) => { dom.each(callback); return el; },
        get: (index) => dom.get(index),
        first: () => {
          const first = dom.first();
          return first.elements[0] || null;
        },
        hide: () => { dom.hide(); return el; },
        show: () => { dom.show(); return el; }
      };
      Object.entries(methodMap).forEach(([name, fn]) => {
        // Only assign if not a native property (avoid overwriting native DOM properties/getters)
        if (!(name in el)) {
          (el as any)[name] = fn;
        }
      });
    }
    return el as any;
  }

  /**
   * Finds all elements matching the selector within the root.
   */
  refs(selector: string): NodeListOf<HTMLElement> {
    return this.root.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  }
}

export interface DomChainableMethods {
  on(event: string, handler: EventListenerOrEventListenerObject): HTMLElement;
  addClass(classNames: string): HTMLElement;
  removeClass(className: string): HTMLElement;
  toggleClass(className: string): HTMLElement;
  text(value?: string): string | HTMLElement;
  html(value?: string): string | HTMLElement;
  append(child: string | HTMLElement | Dom): HTMLElement;
  find(selector: string): HTMLElement | null;
  children(): HTMLElement | null;
  parent(): HTMLElement | null;
  attr(name: string, value?: string): string | HTMLElement;
  removeAttr(name: string): HTMLElement;
  val(value?: string): string | HTMLElement;
  css(property: string | Record<string, string>, value?: string): HTMLElement;
  each(callback: (element: HTMLElement, index: number) => void): HTMLElement;
  get(index: number): HTMLElement | undefined;
  first(): HTMLElement | null;
  hide(): HTMLElement;
  show(): HTMLElement;
}

export default function $(selectorOrElement: string | HTMLElement | HTMLElement[] | Dom): Dom {
  return new Dom(selectorOrElement);
}
