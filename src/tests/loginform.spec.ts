import { test, expect } from '@playwright/test';

test.describe('ログインフォーム', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login');
  });

  test('ログインフォームの各要素が表示される', async ({ page }) => {
    // タイトルが表示されることを確認
    await expect(page.getByText('アカウントにログイン')).toBeVisible();
    
    // フォーム要素が表示されることを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // 新規登録リンクが表示されることを確認
    await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible();
  });

  test('フォームに入力できる', async ({ page }) => {
    // メールアドレスとパスワードを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    
    // 入力値が反映されていることを確認
    await expect(page.getByLabel('メールアドレス')).toHaveValue('test@example.com');
    await expect(page.getByLabel('パスワード')).toHaveValue('password123');
  });
});