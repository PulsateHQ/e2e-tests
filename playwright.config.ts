import { BASE_URL } from './config/env.config';
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'tmp/session.json');

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./config/global.setup.ts'),
  timeout: 120_000,
  expect: {
    timeout: 90_000
  },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['html'],
    ['github'],
    ['json', { outputFile: './playwright-report/results.json' }],
    ['junit', { outputFile: './playwright-report/results.xml' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false
      }
    ]
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 0,
    trace: 'on',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      timeout: 120_000,
      expect: {
        timeout: 90_000
      },
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      timeout: 120_000,
      expect: {
        timeout: 60_000
      },
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'chrome',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'webkit',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Safari']
      }
    },
    {
      name: 'chromium',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Chromium']
      }
    },
    {
      name: 'setup',
      testMatch: '*.setup.ts'
    }
  ]
});
