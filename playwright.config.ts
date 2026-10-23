import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);
const snapshotDir = process.env.SNAPSHOT_DIR ?? 'tests/e2e/.snapshots';

/**
 * SITE_DIR picks what is served (default: `dist`, the output of `npm run build`). SNAPSHOT_DIR picks where the visual
 * baseline lives, so a baseline taken from one build can be compared with another.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  snapshotPathTemplate: `${snapshotDir}/{projectName}/{arg}{ext}`,
  // The e2e-runner VM has under 1 GB of RAM: one worker at a time keeps Chromium from being OOM-killed.
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${port}`, contextOptions: { reducedMotion: 'reduce' } },
  expect: {
    timeout: 30_000,
    toHaveScreenshot: { maxDiffPixels: 0, threshold: 0, animations: 'disabled' },
  },
  webServer: {
    command: 'node tests/support/static-server.mjs',
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    env: { PORT: String(port), SITE_DIR: process.env.SITE_DIR ?? 'dist' },
  },
  projects: [
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 1,
        isMobile: false,
      },
    },
    {
      name: 'desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
  ],
});
