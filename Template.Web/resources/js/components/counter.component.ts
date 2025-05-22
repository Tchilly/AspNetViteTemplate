import { Application } from "../core/application";
import type { MyServiceType } from '../services/mock.service';
import { useDom } from '../composables/useDom';
import { useProps } from '../composables/useProps';

interface CounterProps {
  initialCount?: number;
}

/**
 * anotherMethodFunction
 *
 * This function is an example of a method that can be called from the CounterController.
 * It uses the Application instance to resolve services and manipulate the DOM.
 *
 * @param app - The application instance
 */
function anotherMethodFunction(app: Application) {
  const $ = useDom();
  console.log("anotherMethodFunction called");
  $('body').toggleClass('another-method-triggered-functional');

  // If you needed to use a service from app:
  const myService = app.resolve<MyServiceType>('myServiceName');
  console.log(myService.getMessage());
}

/**
 * CounterComponent
 *
 * This is a functional component that serves as a controller for the counter component.
 * It is responsible for rendering the component and handling events.
 * It uses the Application instance to resolve services and manage state.
 * It can receive an `initialCount` via a `data-props` attribute.
 *
 * @param el - The HTML element to attach the controller to, may contain `data-props` e.g. `data-props='{"initialCount": 5}'`
 * @param app - The application instance
 */
export default function CounterComponent(el: HTMLElement, app: Application): void {
  const $ = useDom();
  const props = useProps<CounterProps>(el, { initialCount: 0 });
  const elWrapper = $(el); // Wrap el once for consistent DOM manipulation

  let currentCount = props?.initialCount ?? 0;

  const render = () => {
    console.log('CounterComponent render on', el, 'with props:', props);

    // Create some elements
    const countDisplay = $('<span>').text(`Count: ${currentCount} `);
    const button = $('<button>').text('Increment');

    // Append elements to the wrapper
    elWrapper.append(countDisplay);
    elWrapper.append(button);

    // Add a click event listener to the button
    button.on('click', () => {
      currentCount++;
      countDisplay.text(`Count: ${currentCount} `); // Update text, maintaining the space
      console.log('Button clicked! Element:', el, 'New count:', currentCount);
      anotherMethodFunction(app); // Pass app to the function
    });
  };

  render();
}
