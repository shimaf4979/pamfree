import { defineConfig, devices } from '@playwright/test';

/**
 * Playwrightの設定ファイル。
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* テストのタイムアウト時間 */
  timeout: 30 * 1000,
  /* テスト実行の期待値 */
  expect: {
    /**
     * テストに使用されるassertionのタイムアウト。
     * つまり、以下のようなものです:
     * await expect(locator).toHaveText('text');
     */
    timeout: 5000
  },
  /* 各テストの最大同時実行数 */
  fullyParallel: true,
  /* テストの失敗時にトレースを取得するかどうか */
  retries: process.env.CI ? 2 : 0,
  /* 各テストワーカーで実行する最大テスト数 */
  workers: process.env.CI ? 1 : undefined,
  /* レポーターを設定する - https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list']
  ],
  /* プロジェクトの共有設定 */
  use: {
    /* 画面のサイズ */
    viewport: { width: 1280, height: 720 },
    /* ベースURL */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    /* すべてのテストでトレース情報を収集 */
    trace: 'on-first-retry',
    /* スクリーンショットを自動的に撮る */
    screenshot: 'only-on-failure',
    /* テストの実行状況を録画 */
    video: 'on-first-retry',
  },

  /* テスト対象のブラウザ設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* モバイルブラウザのテスト */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Webサーバーの起動設定 */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
      },
});