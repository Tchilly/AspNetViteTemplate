/**
 * BaseController
 *
 * This file defines the BaseController class, which serves as a base class for all controllers in the application.
 * It provides a common interface and functionality for all controllers, including the ability to access the DOM
 * elements associated with the controller.
 */
export abstract class BaseController {
  protected el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  };

}
