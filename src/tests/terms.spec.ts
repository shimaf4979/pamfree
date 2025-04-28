import { test, expect } from '@playwright/test';

test.describe('利用規約・プライバシーポリシーページ', () => {
  test('利用規約ページが表示される', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: '利用規約' })).toBeVisible();
  });

});