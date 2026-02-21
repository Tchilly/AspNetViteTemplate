import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

type AppSettings = {
  Host?: {
    Name?: string;
    HttpPort?: number;
  };
};

function getSharedTestBaseUrl(): string {
  const defaultHost = 'localhost';
  const defaultPort = 5000;

  try {
    const appsettingsPath = path.resolve(new URL('.', import.meta.url).pathname, 'appsettings.json');
    const appsettings = JSON.parse(readFileSync(appsettingsPath, 'utf8')) as AppSettings;
    const host = appsettings.Host?.Name ?? defaultHost;
    const port = appsettings.Host?.HttpPort ?? defaultPort;

    return `http://${host}:${port}`;
  } catch {
    return `http://${defaultHost}:${defaultPort}`;
  }
}

const sharedBaseUrl = getSharedTestBaseUrl();

export default defineConfig({
  testDir: '../Template.Web.Tests/browser',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: sharedBaseUrl,
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
    url: `${sharedBaseUrl}/todos`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      ASPNETCORE_ENVIRONMENT: 'Testing',
      ASPNETCORE_URLS: sharedBaseUrl,
    },
  },
});
