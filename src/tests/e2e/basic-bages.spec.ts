import { test, expect } from '@playwright/test';

// 基本的なページナビゲーションのテスト
test.describe('基本的なページナビゲーション', () => {
  test('ホームページが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルを確認
    await expect(page).toHaveTitle(/Pamfree/);
    
    // ヘッダーが表示されていることを確認
    const header = page.locator('nav');
    await expect(header).toBeVisible();
    
    // フッターが表示されていることを確認
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // ログインリンクが表示されていることを確認
    const loginLink = page.getByRole('link', { name: 'ログイン' });
    await expect(loginLink).toBeVisible();
    
    // 新規登録リンクが表示されていることを確認
    const registerLink = page.getByRole('link', { name: '新規登録' });
    await expect(registerLink).toBeVisible();
  });
  
  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/login');
    
    // ログインフォームが表示されていることを確認
    const emailInput = page.getByLabel('メールアドレス');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.getByLabel('パスワード');
    await expect(passwordInput).toBeVisible();
    
    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await expect(loginButton).toBeVisible();
    
    // 新規登録ページへのリンクが表示されていることを確認
    const registerLink = page.getByRole('link', { name: '新規登録' });
    await expect(registerLink).toBeVisible();
  });
  
  test('新規登録ページが正しく表示される', async ({ page }) => {
    await page.goto('/register');
    
    // 登録フォームが表示されていることを確認
    const nameInput = page.getByLabel('お名前');
    await expect(nameInput).toBeVisible();
    
    const emailInput = page.getByLabel('メールアドレス');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.getByLabel('パスワード');
    await expect(passwordInput).toBeVisible();
    
    const confirmPasswordInput = page.getByLabel('パスワード（確認）');
    await expect(confirmPasswordInput).toBeVisible();
    
    const registerButton = page.getByRole('button', { name: 'アカウント作成' });
    await expect(registerButton).toBeVisible();
    
    // ログインページへのリンクが表示されていることを確認
    const loginLink = page.getByRole('link', { name: 'ログイン' });
    await expect(loginLink).toBeVisible();
  });
  
  test('プライバシーポリシーページが正しく表示される', async ({ page }) => {
    await page.goto('/privacy');
    
    // ページタイトルを確認
    const heading = page.getByRole('heading', { name: 'プライバシーポリシー' });
    await expect(heading).toBeVisible();
  });
  
  test('利用規約ページが正しく表示される', async ({ page }) => {
    await page.goto('/terms');
    
    // ページタイトルを確認
    const heading = page.getByRole('heading', { name: '利用規約' });
    await expect(heading).toBeVisible();
  });
  
  test('未認証ユーザーがアクセス制限されたページにアクセスするとログインページにリダイレクトされる', async ({ page }) => {
    // ダッシュボードページにアクセス
    await page.goto('/dashboard');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login');
    
    // アカウント設定ページにアクセス
    await page.goto('/account');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login');
  });
});