import { Application } from './core/application';
import '../css/app.css';
import './bootstrap';
import { MockService } from './services/mock.service';
import { CacheService } from '@/services/cache.service';
import { LocalStorageCacheDriver } from '@/core/cache';

/**
 * Application initialization
 *
 * This file is responsible for bootstrapping the application, registering
 * services, and initializing the application.
 */
const app = new Application();

// Register services
app
  .provide('myServiceName', () => new MockService())
  .provide('cache', () => new CacheService(new LocalStorageCacheDriver(), { ttl: 10000 }))
  .register('counter', () => import('./components/counter.component.ts'));

app.boot();

