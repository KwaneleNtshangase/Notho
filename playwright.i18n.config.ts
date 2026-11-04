import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });

export default defineConfig({
  testDir: './e2e', testMatch: '08-i18n.spec.ts', fullyParallel: false, workers: 1,
  timeout: 120_000, expect: { timeout: 20_000 }, reporter: 'list',
  // Auth material stays out of traces and videos.
  // Route mocks isolate shared-account writes and missing-pack recovery. A
  // service worker can bypass those routes or reload mid-navigation.
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3210', ...(process.env.I18N_STORAGE_STATE ? { storageState: process.env.I18N_STORAGE_STATE } : {}), serviceWorkers: 'block', trace: 'off', video: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'i18n-desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 900 } } },
    { name: 'i18n-tablet', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1024, height: 768 } } },
    { name: 'i18n-mobile', use: { ...devices['Pixel 7'], channel: 'chrome', viewport: { width: 320, height: 740 } } },
  ],
});
