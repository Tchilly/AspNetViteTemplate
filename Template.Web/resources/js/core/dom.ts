// filepath: d:\Webdev\Tchilly\Template.Web\resources\js\core\dom.ts

export class DOMWrapper {
  public elements: HTMLElement[];

  constructor(selectorOrElement: string | HTMLElement | HTMLElement[] | DOMWrapper) {
    if (selectorOrElement instanceof DOMWrapper) {
      this.elements = selectorOrElement.elements;
    } else if (selectorOrElement instanceof HTMLElement) {
      this.elements = [selectorOrElement];
    } else if (Array.isArray(selectorOrElement) && selectorOrElement.every(e => e instanceof HTMLElement)) {
      this.elements = selectorOrElement as HTMLElement[];
    } else if (typeof selectorOrElement === 'string') {
      if (selectorOrElement.trim().startsWith('<')) {
        // Create element(s) from HTML string
        const template = document.createElement('template');
        template.innerHTML = selectorOrElement.trim();
        this.elements = Array.from(template.content.childNodes).filter(
          node => node.nodeType === Node.ELEMENT_NODE
        ) as HTMLElement[];
      } else {
        // Select elements from DOM
        this.elements = Array.from(document.querySelectorAll(selectorOrElement));
      }
    } else {
      this.elements = [];
    }
  }

  on(eventName: string, handler: EventListenerOrEventListenerObject): this {
    this.elements.forEach(el => el.addEventListener(eventName, handler));
    return this;
  }

  addClass(className: string): this {
    this.elements.forEach(el => el.classList.add(className));
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

  // Overload for text()
  text(): string;
  text(value: string): this;
  text(value?: string): string | this {
    if (value === undefined) {
      return this.elements.map(el => el.textContent || '').join('');
    }
    this.elements.forEach(el => el.textContent = value);
    return this;
  }

  // Overload for html()
  html(): string;
  html(value: string): this;
  html(value?: string): string | this {
    if (value === undefined) {
      // For multiple elements, jQuery returns html of first. For single, its html.
      return this.elements[0] ? this.elements[0].innerHTML : '';
    }
    this.elements.forEach(el => el.innerHTML = value);
    return this;
  }

  append(child: string | HTMLElement | DOMWrapper): this {
    this.elements.forEach(el => {
      if (typeof child === 'string') {
        el.insertAdjacentHTML('beforeend', child);
      } else if (child instanceof HTMLElement) {
        el.appendChild(child);
      } else if (child instanceof DOMWrapper) {
        child.elements.forEach(childEl => el.appendChild(childEl)); // Changed: append actual childEl, not a clone
      }
    });
    return this;
  }

  find(selector: string): DOMWrapper {
    const foundElements: HTMLElement[] = [];
    this.elements.forEach(el => {
      el.querySelectorAll(selector).forEach(foundEl => {
        if (foundEl instanceof HTMLElement) {
          foundElements.push(foundEl);
        }
      });
    });
    return new DOMWrapper(foundElements);
  }

  children(): DOMWrapper {
    const childElements: HTMLElement[] = [];
    this.elements.forEach(el => {
      childElements.push(...Array.from(el.children) as HTMLElement[]);
    });
    return new DOMWrapper(childElements);
  }

  parent(): DOMWrapper {
    const parentElements: HTMLElement[] = [];
    this.elements.forEach(el => {
      if (el.parentElement && !parentElements.includes(el.parentElement)) {
        parentElements.push(el.parentElement);
      }
    });
    return new DOMWrapper(parentElements);
  }

  // Overload for attr()
  attr(name: string): string | null;
  attr(name: string, value: string): this;
  attr(name: string, value?: string): string | null | this {
    if (value === undefined) {
      return this.elements[0] ? this.elements[0].getAttribute(name) : null;
    }
    this.elements.forEach(el => el.setAttribute(name, value));
    return this;
  }

  removeAttr(name: string): this {
    this.elements.forEach(el => el.removeAttribute(name));
    return this;
  }

  // Overload for val()
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

  // Allow iteration e.g. for (let el of $(...).elements) or $(...).each(el => ...)
  each(callback: (element: HTMLElement, index: number) => void): this {
    this.elements.forEach((el, index) => callback(el, index));
    return this;
  }

  get(index: number): HTMLElement | undefined {
    return this.elements[index];
  }

  first(): DOMWrapper {
    return new DOMWrapper(this.elements[0] ? [this.elements[0]] : []);
  }

  // Basic hide/show
  hide(): this {
    this.elements.forEach(el => el.style.display = 'none');
    return this;
  }

  show(): this {
    this.elements.forEach(el => el.style.display = ''); // Revert to default display
    return this;
  }
}

export default function $(selectorOrElement: string | HTMLElement | HTMLElement[] | DOMWrapper): DOMWrapper {
  return new DOMWrapper(selectorOrElement);
}
