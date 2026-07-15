import { expect, test } from '@playwright/test';
test('entry layout', async ({ page }) => { await page.goto('./'); await expect(page).toHaveScreenshot('entry.png', { animations: 'disabled', fullPage: true }); });
