type ControllerConstructor = new (el: HTMLElement, app: Application) => any;
type ControllerLoader = () => Promise<{ default: ControllerConstructor }>;
type ServiceFactory = () => any;

export class Application {
  private controllers: Record<string, ControllerLoader> = {};
  private services: Map<string, any> = new Map();

  register(name: string, loader: ControllerLoader): this {
    this.controllers[name] = loader;
    return this;
  }

  provide(name: string, factory: ServiceFactory): this {
    this.services.set(name, factory);
    return this;
  }

  resolve<T = any>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not registered`);
    }
    return service;
  }

  async boot(): Promise<void> {
    document.querySelectorAll<HTMLElement>('[data-controller]').forEach(async (el) => {
      const name = el.dataset.controller;
      if (!name || !this.controllers[name]) return;
      const module = await this.controllers[name]();
      new module.default(el, this);
    });
  }
}
