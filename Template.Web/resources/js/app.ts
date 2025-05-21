import { Application } from './core/application';
import '../css/app.css';
import './bootstrap';
import $ from './core/dom';

/**
 * Application initialization
 *
 * This file is responsible for bootstrapping the application, registering
 * services, and initializing the application.
 */
const app = new Application();

// Register the global $ helper as a service for use in any controller
app
  .provide('dom', () => $)
  //.provide('store', () => new Store())
  .register('counter', () => import('./controllers/counter.controller.ts'));

app.boot();

