import { Application } from "../core/application";
import { BaseController } from "./base.controller";
import { useDom } from '../composables/useDom';

export default class CounterController extends BaseController {

  constructor(el: HTMLElement, app: Application) {
    super(el, app);
    this.render();
  }

  render() {
    const $ = useDom(this);

    console.log('CounterController render on', this.el);

    const button = $('<button>').text('Click me (useDom in method)!');
    $(this.el).append(button);

    button.on('click', () => {
      console.log('Button clicked! Element:', this.el);
      this.anotherMethod();
    });
  }

  anotherMethod() {
    const $ = useDom(this);
    console.log("anotherMethod called");
    $('body').toggleClass('another-method-triggered-local-scope');
  }

}
