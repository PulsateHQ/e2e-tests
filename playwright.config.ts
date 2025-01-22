import { BASE_URL } from './config/env.config';
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'tmp/session.json');

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./config/global.setup.ts'),
  timeout: 60_000,
  expect: {
    timeout: 60_000
  },
  fullyParallel: false,
  retries: 0,
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
        suiteTitle: false,
        categories: [
          {
            name: 'Retries',
            messageRegex: '.*',
            matchedStatuses: ['skipped']
          }
        ]
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
      use: {
        ...devices['Desktop Firefox']
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
