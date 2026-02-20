import path from 'node:path';
import { Module } from 'node:module';
import { defineConfig, devices } from '@playwright/test';

const nodeModulesPath = path.resolve(new URL('.', import.meta.url).pathname, 'node_modules');
process.env.NODE_PATH = process.env.NODE_PATH
  ? `${nodeModulesPath}${path.delimiter}${process.env.NODE_PATH}`
  : nodeModulesPath;
Module._initPaths();

export default defineConfig({
  testDir: '../Template.Web.Tests/browser',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'dotnet run --no-launch-profile --no-build',
    url: 'http://localhost:5000/todos',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      ASPNETCORE_ENVIRONMENT: 'Testing',
      ASPNETCORE_URLS: 'http://localhost:5000',
    },
  },
});
