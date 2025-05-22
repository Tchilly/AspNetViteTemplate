export interface ComponentConstructor {
  new (el: HTMLElement, app: Application): any;
}
export interface ComponentLoader {
  (): Promise<{ default: ComponentConstructor }>;
}
export interface ServiceFactory {
  (): any;
}

export class Application {
  private components: Record<string, ComponentLoader> = {};
  private services: Map<string, any> = new Map();

  register(name: string, loader: ComponentLoader): this {
    this.components[name] = loader;
    return this;
  }

  provide(name: string, factory: ServiceFactory): this {
    this.services.set(name, factory()); // Store the instance
    return this;
  }

  resolve<T = any>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }
    return service as T;
  }

  async boot(): Promise<void> {
    document.querySelectorAll<HTMLElement>('[data-component]').forEach(async (el) => {
      const name = el.dataset.component;
      if (!name || !this.components[name]) return;
      try {
        const module = await this.components[name]();
        new module.default(el, this);
      } catch (error) {
        console.error(`Error loading component "${name}":`, error);
      }
    });
  }
}
