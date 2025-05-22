import { Application } from "@/core/application";
import { BaseComponent } from '@/components/base.component';
import type { MyServiceType } from '@/services/mock.service';
import { CacheService } from '@/services/cache.service';

/**
 * @interface CounterProps
 * Defines the properties accepted by the CounterComponent.
 * @property initialCount - Optional initial value for the counter. Defaults to 0.
 */
interface CounterProps {
  initialCount?: number | null;
}

/**
 * @module CounterComponent
 * A class-based component that displays a counter with an increment button.
 *
 * It initializes with a count, optionally provided via a `data-props` HTML attribute,
 * and allows the user to increment this count. It also demonstrates service
 * resolution and basic DOM manipulation using the BaseController.
 *
 * @param el - The HTMLElement to which this component is bound.
 *             Expected to have a `data-component="counter"` attribute.
 *             Can also accept `data-props='{"initialCount": number}'` to set the initial counter value.
 * @param app - The global application instance, used for service resolution and other app-level interactions.
 */
export default class CounterComponent extends BaseComponent {
  private countDisplay: HTMLElement | null;
  private currentCount: number;
  private myService: MyServiceType;
  private props: CounterProps;
  private cache: CacheService;

  constructor(el: HTMLElement, app: Application) {
    super(el, app);

    // Resolve the services
    this.myService = this.app.resolve<MyServiceType>('myServiceName');
    this.cache = this.app.resolve<CacheService>('cache');

    // Define default props and cache for 10 seconds in localStorage
    const defaultProps = this.defineProps<CounterProps>(
      { initialCount: 1 },
      'counter-initial',
      { ttl: 10000, tag: 'counter', storage: 'local' }
    );

    this.props = this.useProps<CounterProps>(defaultProps);

    // Ensure initialCount is a number, default to 0 if not
    this.currentCount = this.cache.get('counter.currentCount', this.props.initialCount);

    // Counter display element
    this.countDisplay = this.ref('[data-counter-display]');

    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    this.ref('[data-counter-button]')?.on?.('click', () => this.increment());
    this.ref('[data-counter-decrement]')?.on?.('click', () => this.decrement());
    this.ref('[data-counter-reset]')?.on?.('click', () => this.reset());
    this.ref('[data-counter-set150]')?.on?.('click', () => this.setCount(150));
    this.ref('[data-counter-clearcache]')?.on?.('click', () => this.clearCache());
    this.ref('[data-counter-fakefetch]')?.on?.('click', () => this.fakeFetch());
  }

  private increment(): void {
    this.currentCount++;
    this.render();
    // Persist count for 10 seconds in localStorage using this.cache
    this.cache.set('counter.currentCount', this.currentCount);
    if (this.myService) {
      this.myService.performAction();
    }
    console.log('Button clicked! New count:', this.currentCount);
  }

  private decrement(): void {
    this.currentCount--;
    this.render();
    this.cache.set('counter.currentCount', this.currentCount);
    if (this.myService) {
      this.myService.performAction();
    }
    console.log('Decrement clicked! New count:', this.currentCount);
  }

  private reset(): void {
    this.currentCount = this.props.initialCount ?? 0;
    this.render();
    this.cache.set('counter.currentCount', this.currentCount);
    if (this.myService) {
      this.myService.performAction();
    }
    console.log('Reset clicked! Count reset to:', this.currentCount);
  }

  private setCount(val: number): void {
    this.currentCount = val;
    this.render();
    this.cache.set('counter.currentCount', this.currentCount);
    if (this.myService) {
      this.myService.performAction();
    }
    console.log('Set count clicked! Count set to:', this.currentCount);
  }

  private clearCache(): void {
    this.cache.invalidate('counter.currentCount');
    if (this.myService) {
      this.myService.performAction();
    }
    console.log('Cache cleared for counter.currentCount');
  }

  private fakeFetch(): void {
    if (this.myService) {
      this.myService.performAction();
      console.log('[Demo] Here you could implement a fetch/post request.');
    }
    console.log('Fake fetch/post button clicked!');
  }

  private render(): void {
    if (this.countDisplay) {
      this.countDisplay.textContent = `Count: ${this.currentCount} `;
    }
  }

}
