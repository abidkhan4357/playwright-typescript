import { defineConfig, devices } from '@playwright/test';
import { ConfigManager } from './core/config/config.manager';

const config = ConfigManager.getInstance();

export default defineConfig({
  globalSetup: './global.setup.ts',
  testDir: './',
  testMatch: /.*\/(ui-tests|api-tests)\/.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: config.baseUrl,
    testIdAttribute: 'data-qa',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: config.get('headless', true),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
