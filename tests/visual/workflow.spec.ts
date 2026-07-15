import { expect, test } from '@playwright/test';
import { createVideoFixture } from '../fixtures/media';

test('guided workflow stages', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video }); await expect(page.getByRole('heading', { name: '選取要重複的動作' })).toBeVisible(); await expect(page.getByText('Clip Pulse')).toBeVisible();
  const options = { animations: 'disabled' as const, fullPage: true, mask: [page.locator('video, input[type="text"], input[type="range"]'), page.locator('span.font-mono'), page.getByText(/選取長度：|成品長度：/)], maskColor: '#18181b' };
  await page.waitForTimeout(100); await expect(page).toHaveScreenshot('workflow-select.png', options); await page.getByRole('button', { name: '下一步' }).click(); await expect(page.getByRole('heading', { name: '設定節奏與拍點' })).toBeVisible(); await page.waitForTimeout(100); await expect(page).toHaveScreenshot('workflow-rhythm.png', options); await page.getByRole('button', { name: '下一步' }).click(); await expect(page.getByRole('heading', { name: '預覽與匯出' })).toBeVisible(); await page.waitForTimeout(100); await expect(page).toHaveScreenshot('workflow-preview.png', options);
});
