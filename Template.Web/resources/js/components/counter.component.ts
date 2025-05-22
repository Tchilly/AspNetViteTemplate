import { Application } from "../core/application";
import { useDom } from '../composables/useDom';
import type { MyServiceType } from '../services/mock.service';
import { useProps } from '../composables/useProps'; // Import useProps

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

interface CounterProps {
  initialCount?: number;
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

  let currentCount = props?.initialCount ?? 0;

  const render = () => {
    console.log('CounterComponent render on', el, 'with props:', props);

    const countDisplay = $('<span>').text(`Count: ${currentCount} `); // Added space after currentCount
    const button = $('<button>').text('Increment');
    
    el.innerHTML = ''; // Clear element using standard DOM API
    
    // Append elements sequentially
    const elWrapper = $(el);
    elWrapper.append(countDisplay);
    elWrapper.append(button);

    button.on('click', () => {
      currentCount++;
      countDisplay.text(`Count: ${currentCount} `); // Update text, maintaining the space
      console.log('Button clicked! Element:', el, 'New count:', currentCount);
      anotherMethodFunction(app); // Pass app to the function
    });
  };

  render();
}
