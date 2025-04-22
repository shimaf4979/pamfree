import { Page, expect } from '@playwright/test';

// ログイン処理を行うユーティリティ関数
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('メールアドレス').fill(email);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ダッシュボードページにリダイレクトされたことを確認
  await expect(page).toHaveURL('/dashboard');
}

// テスト用アカウント情報
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'テストユーザー'
};

// テスト用マップ情報
export const TEST_MAP = {
  map_id: 'test-map',
  title: 'テストマップ',
  description: 'テスト用のマップです',
  is_publicly_editable: true
};

// テスト用フロア情報
export const TEST_FLOOR = {
  floor_number: 1,
  name: '1階'
};

// テスト用ピン情報
export const TEST_PIN = {
  title: 'テストピン',
  description: 'テスト用のピンです',
  x_position: 50,
  y_position: 50
};

// エラーメッセージの確認
export async function expectErrorMessage(page: Page, message: string) {
  const errorElement = page.locator('div').filter({ hasText: message });
  await expect(errorElement).toBeVisible();
}

// 成功メッセージの確認
export async function expectSuccessMessage(page: Page, message: string) {
  const successElement = page.locator('div').filter({ hasText: message });
  await expect(successElement).toBeVisible();
}

// マップカードのセレクタを生成
export function getMapCardSelector(title: string) {
  return `div:has-text("${title}") >> xpath=ancestor::div[contains(@class, "bg-white")]`;
}

// フロアカードのセレクタを生成
export function getFloorCardSelector(name: string) {
  return `div:has-text("${name}") >> xpath=ancestor::div[contains(@class, "cursor-pointer")]`;
}

// ピンカードのセレクタを生成
export function getPinCardSelector(title: string) {
  return `div:has-text("${title}") >> xpath=ancestor::button[contains(@class, "border-b")]`;
}

// モーダルが表示されているか確認
export async function expectModalToBeVisible(page: Page, title: string) {
  const modal = page.locator(`div[role="dialog"]:has-text("${title}")`);
  await expect(modal).toBeVisible();
}

// モーダルが非表示か確認
export async function expectModalNotToBeVisible(page: Page, title: string) {
  const modal = page.locator(`div[role="dialog"]:has-text("${title}")`);
  await expect(modal).not.toBeVisible();
}