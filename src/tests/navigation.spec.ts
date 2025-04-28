import { test, expect } from '@playwright/test';

test.describe('基本ナビゲーション', () => {
  test('ホームページにアクセスできる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/パンフリー|Pamfree/);
  });

  test('ログインページにアクセスできる', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('アカウントにログイン')).toBeVisible();
  });

  test('新規登録ページにアクセスできる', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('新規アカウント登録')).toBeVisible();
  });
});