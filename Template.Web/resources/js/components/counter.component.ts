import { Application } from "../core/application";
import type { MyServiceType } from '../services/mock.service';
import { useDom } from '../composables/useDom'; // Assuming DOMWrapper is exported
import { useProps } from '../composables/useProps';

/**
 * @interface CounterProps
 * Defines the properties accepted by the CounterComponent.
 * @property initialCount - Optional initial value for the counter. Defaults to 0.
 */
interface CounterProps {
  initialCount?: number | null;
}

/**
 * _anotherMethodFunction (Private)
 *
 * An example utility function demonstrating service resolution and DOM manipulation.
 * This function is intended for internal use within the CounterComponent's scope.
 *
 * @param app - The application instance, used to resolve services.
 */
function _anotherMethodFunction(app: Application): void {
  const $ = useDom();
  console.log("_anotherMethodFunction called");
  $('body').toggleClass('another-method-triggered-functional');

  // Example of resolving a service from the application instance
  const myService = app.resolve<MyServiceType>('myServiceName');
  console.log(myService.getMessage());
}

/**
 * @module CounterComponent
 * A functional component that displays a counter with an increment button.
 *
 * It initializes with a count, optionally provided via a `data-props` HTML attribute,
 * and allows the user to increment this count. It also demonstrates service
 * resolution and basic DOM manipulation using composables.
 *
 * @param el - The HTMLElement to which this component is bound.
 *             Expected to have a `data-component="counter"` attribute.
 *             Can also accept `data-props='{"initialCount": number}'` to set the initial counter value.
 * @param app - The global application instance, used for service resolution and other app-level interactions.
 */
export default function CounterComponent(el: HTMLElement, app: Application): void {
  const $ = useDom();
  const { initialCount } = useProps<CounterProps>(el, { initialCount: 0 });
  const elWrapper = $(el);

  let currentCount: number = initialCount ?? 0;

  /**
   * Initializes the counter UI, creates elements, and attaches necessary event handlers.
   * This function is called once when the component is bootstrapped.
   */
  const initializeCounter = (): void => {
    console.log('CounterComponent: Initializing UI on', el, 'with initialCount:', initialCount);

    const countDisplay = elWrapper.find('[data-counter-display]');
    const button = elWrapper.find('[data-counter-button]');

    countDisplay.text(`Count: ${currentCount} `);

    button.on('click', () => {
      currentCount++;
      countDisplay.text(`Count: ${currentCount} `);
      console.log('Button clicked! Element:', el, 'New count:', currentCount);
      _anotherMethodFunction(app); // Call example utility function
    });
  };

  // Initialize the component
  initializeCounter();
}
