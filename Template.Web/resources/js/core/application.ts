// New types for functional components
export type FunctionalComponent = (el: HTMLElement, app: Application) => void | Promise<void>; // Can be sync or async
export type FunctionalComponentLoader = () => Promise<{ default: FunctionalComponent }>;

// Define ServiceFactory - adjust if your factory is more complex
export type ServiceFactory = () => any;

export class Application {
  private components: Record<string, FunctionalComponentLoader> = {}; // New type
  private services: Map<string, ServiceFactory> = new Map(); // Store factory

  register(name: string, loader: FunctionalComponentLoader): this { // New signature
    this.components[name] = loader;
    return this;
  }

  provide(name: string, factory: ServiceFactory): this {
    this.services.set(name, factory);
    return this;
  }

  resolve<T = any>(name: string): T {
    const factory = this.services.get(name); // Get the factory
    if (!factory) {
      throw new Error(`Service "${name}" not registered`);
    }
    return factory() as T; // Execute the factory to get the instance
  }

  async boot(): Promise<void> {
    document.querySelectorAll<HTMLElement>('[data-component]').forEach(async (el) => {
      const name = el.dataset.component;
      if (!name || !this.components[name]) return;
      const module = await this.components[name]();
      module.default(el, this); // New: call the function
    });
  }
}
