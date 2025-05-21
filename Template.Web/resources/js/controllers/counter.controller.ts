import { BaseController } from "./base.controller";

export default class CounterController extends BaseController {
  constructor(el: HTMLElement) {
    super(el);
    this.render();
  }

  render() {
    console.log('CounterController render on', this.el);
  }
}
