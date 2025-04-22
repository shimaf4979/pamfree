import { test, expect } from '@playwright/test';
import { TEST_USER, login, expectErrorMessage } from '../utils/test-utils';

// 認証フローのテスト
test.describe('認証フロー', () => {
  // ユニークなユーザー名を生成するためのヘルパー
  const getUniqueEmail = () => `test_${Date.now()}@example.com`;
  
  test('新規ユーザーの登録とログインが正常に機能する', async ({ page }) => {
    const uniqueEmail = getUniqueEmail();
    const name = 'テストユーザー';
    const password = 'password123';
    
    // 1. 新規登録ページにアクセス
    await page.goto('/register');
    
    // 2. 登録フォームに入力
    await page.getByLabel('お名前').fill(name);
    await page.getByLabel('メールアドレス').fill(uniqueEmail);
    await page.getByLabel('パスワード').fill(password);
    await page.getByLabel('パスワード（確認）').fill(password);
    
    // 3. 登録ボタンをクリック
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    
    // 4. ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login?registered=true');
    
    // 5. 成功メッセージが表示されることを確認
    const successMessage = page.locator('div.bg-green-50').filter({ hasText: '登録が完了しました' });
    await expect(successMessage).toBeVisible();
    
    // 6. ログインフォームに入力
    await page.getByLabel('メールアドレス').fill(uniqueEmail);
    await page.getByLabel('パスワード').fill(password);
    
    // 7. ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 8. ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/dashboard');
    
    // 9. ユーザー名が表示されていることを確認
    const userNameButton = page.locator('button').filter({ hasText: name });
    await expect(userNameButton).toBeVisible();
  });
  
  test('間違ったパスワードでログインするとエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    
    // 正しいメールアドレスと間違ったパスワードを入力
    await page.getByLabel('メールアドレス').fill(TEST_USER.email);
    await page.getByLabel('パスワード').fill('wrong_password');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // エラーメッセージが表示されることを確認
    await expectErrorMessage(page, 'メールアドレスまたはパスワードが正しくありません');
    
    // ログインページに留まっていることを確認
    await expect(page).toHaveURL('/login');
  });
  
  test('既に使用されているメールアドレスで登録するとエラーが表示される', async ({ page }) => {
    await page.goto('/register');
    
    // 既に使用されているメールアドレスを入力
    await page.getByLabel('お名前').fill('テストユーザー2');
    await page.getByLabel('メールアドレス').fill(TEST_USER.email);
    await page.getByLabel('パスワード').fill('password123');
    await page.getByLabel('パスワード（確認）').fill('password123');
    
    // 登録ボタンをクリック
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    
    // エラーメッセージが表示されることを確認
    await expectErrorMessage(page, 'このメールアドレスは既に登録されています');
    
    // 登録ページに留まっていることを確認
    await expect(page).toHaveURL('/register');
  });
  
  test('パスワード確認が一致しない場合はエラーが表示される', async ({ page }) => {
    await page.goto('/register');
    
    // パスワードとパスワード確認が一致しない情報を入力
    await page.getByLabel('お名前').fill('テストユーザー3');
    await page.getByLabel('メールアドレス').fill(getUniqueEmail());
    await page.getByLabel('パスワード').fill('password123');
    await page.getByLabel('パスワード（確認）').fill('different_password');
    
    // 登録ボタンをクリック
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    
    // エラーメッセージが表示されることを確認
    await expectErrorMessage(page, 'パスワードが一致しません');
    
    // 登録ページに留まっていることを確認
    await expect(page).toHaveURL('/register');
  });
  
  test('ログアウトが正常に機能する', async ({ page }) => {
    // まずログイン
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // ユーザーメニューを開く
    await page.locator('button').filter({ hasText: TEST_USER.name }).click();
    
    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();
    
    // ホームページにリダイレクトされることを確認
    await expect(page).toHaveURL('/');
    
    // ログインリンクが表示されていることを確認
    const loginLink = page.getByRole('link', { name: 'ログイン' });
    await expect(loginLink).toBeVisible();
  });
});