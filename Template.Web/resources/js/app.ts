import '../css/app.css';
import './bootstrap';
import { Application } from './core/application';

/**
 * Application entry point for a JavaScript application.
 *
 * This file is responsible for bootstrapping the application, registering
 * services, and initializing the application.
 */
const app = new Application();

app
  //.provide('store', () => new Store())
  .register('counter', () => import('./controllers/counter.controller.ts'))

app.boot();
