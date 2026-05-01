import { test, expect } from '@playwright/test';

test.describe('DevDocs Agent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.afterEach(async ({ page }) => {
    // ストリーミング完了後にネットワーク接続が切れるまで待ってからページ離脱させる
    await page.waitForLoadState('networkidle', { timeout: 60000 });
  });

  test('should display chat interface', async ({ page }) => {
    await expect(page.getByPlaceholder(/メッセージ|質問/)).toBeVisible();
    await expect(page.getByRole('button', { name: /送信/ })).toBeVisible();
  });

  test('should search React docs with Context7', async ({ page }) => {
    await page.getByPlaceholder(/メッセージ|質問/).fill('ReactのuseStateの使い方を教えて');
    await page.getByRole('button', { name: /送信/ }).click();

    // Context7からの回答を待つ
    await expect(page.getByText(/useState|state/i)).toBeVisible({ timeout: 30000 });
  });

  test('should search Next.js routing docs', async ({ page }) => {
    await page.getByPlaceholder(/メッセージ|質問/).fill('Next.jsのApp Routerについて教えて');
    await page.getByRole('button', { name: /送信/ }).click();

    await expect(page.getByText(/App Router|routing|ルーティング/i)).toBeVisible({ timeout: 30000 });
  });

  test('should use web search for trends', async ({ page }) => {
    await page.getByPlaceholder(/メッセージ|質問/).fill('2025年のReactの最新動向は？');
    await page.getByRole('button', { name: /送信/ }).click();

    // Web検索結果を待つ（アシスタントのメッセージバブルが表示される）
    await expect(page.locator('[class*="justify-start"]').first()).toBeVisible({ timeout: 30000 });
  });

  test('should answer basic questions without tools', async ({ page }) => {
    await page.getByPlaceholder(/メッセージ|質問/).fill('forループとは何ですか？');
    await page.getByRole('button', { name: /送信/ }).click();

    // ツールなしで即座に回答
    await expect(page.getByText(/繰り返し|ループ|iteration/i)).toBeVisible({ timeout: 15000 });

  });
});
