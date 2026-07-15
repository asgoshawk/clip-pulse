import { expect, test } from '@playwright/test';
import { createPulseWav, createVideoFixture } from '../fixtures/media';
test('shows the private local-first entry experience', async ({ page }) => { const requests:string[]=[]; page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))requests.push(r.url())}); await page.goto('./'); await expect(page.getByRole('heading',{name:'讓動作跟著節奏跳動'})).toBeVisible(); await expect(page.getByText('檔案只在這台裝置處理，不會上傳。')).toBeVisible(); expect(requests).toEqual([]); });
test('opens the native file chooser from the visible button', async ({ page }) => {
  await page.goto('./');
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '選擇影片', exact: true }).click();
  const chooser = await chooserPromise;
  expect(chooser.isMultiple()).toBe(false);
});
test('rejects an unsupported file defensively', async ({ page }) => { await page.goto('./'); await page.getByLabel('影片檔案').setInputFiles({name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('no')}); await expect(page.getByRole('alert')).toContainText('MP4 或 MOV'); });
test('selects and loop-previews an action range with keyboard-editable time fields', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page);
  const chooserPromise = page.waitForEvent('filechooser'); await page.getByRole('button', { name: '選擇影片', exact: true }).click();
  await (await chooserPromise).setFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  await expect(page.getByRole('heading', { name: '選取要重複的動作' })).toBeVisible(); await expect(page.getByText('影片預覽')).toBeVisible();
  const end = page.getByLabel('終點時間'); await end.fill('0.20'); await end.press('Enter'); await expect(end).toHaveValue('00.200');
  await page.getByRole('button', { name: '循環預覽這個範圍' }).click(); await expect(page.getByRole('status')).toHaveText('正在循環預覽動作片段'); await page.waitForTimeout(350);
  expect(await page.locator('video').evaluate(element => (element as HTMLVideoElement).currentTime)).toBeLessThanOrEqual(0.23);
  await page.getByRole('button', { name: '停止範圍預覽' }).click(); await expect(page.getByRole('status')).toHaveText('預覽已停止');
});
test('creates, removes, and previews beats with an explicit output duration', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  const end = page.getByLabel('終點時間'); await end.fill('0.20'); await end.press('Enter'); await page.getByRole('button', { name: '下一步' }).click(); await expect(page.getByRole('heading', { name: '設定節奏與拍點' })).toBeVisible();
  await page.getByRole('button', { name: '建立拍點' }).click(); await expect(page.getByText(/[1-9][0-9]* 個拍點/).first()).toBeVisible();
  await page.getByRole('button', { name: /刪除 .*秒拍點/ }).first().click(); await expect(page.getByText(/[1-9][0-9]* 個拍點/).first()).toBeVisible();
  await page.getByRole('button', { name: '下一步' }).click(); await expect(page.getByRole('heading', { name: '預覽與匯出' })).toBeVisible();
  const duration = page.getByLabel('輸出總長度'); await duration.fill('1.20'); await duration.press('Enter'); await expect(duration).toHaveValue('01.200'); await expect(page.getByText(/成品長度：1.20 秒/)).toBeVisible();
  await page.getByRole('button', { name: '播放預覽' }).click(); await expect(page.getByRole('status')).toHaveText('正在預覽節奏成品'); await page.waitForTimeout(420);
  const sourceTime = await page.locator('video').evaluate(videoElement => (videoElement as HTMLVideoElement).currentTime);
  expect(sourceTime).toBeGreaterThanOrEqual(0); expect(sourceTime).toBeLessThanOrEqual(0.22);
  await page.getByRole('button', { name: '暫停預覽' }).click(); await expect(page.getByRole('status')).toHaveText('預覽已停止');
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: '匯出 MP4' }).click(); const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('clip-pulse.mp4'); const path = await download.path(); expect(path).toBeTruthy();
  const bytes = await import('node:fs/promises').then(fs => fs.readFile(path!)); expect(bytes.length).toBeGreaterThan(1_000); expect(bytes.subarray(4, 8).toString()).toBe('ftyp');
});
test('analyzes uploaded reference audio locally and creates editable beats', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByLabel('參考節奏音訊').setInputFiles({ name: 'pulse.wav', mimeType: 'audio/wav', buffer: createPulseWav() });
  await expect(page.getByRole('status').filter({ hasText: '找到' })).toContainText(/找到 [1-9][0-9]* 個拍點/); await expect(page.getByText(/[1-9][0-9]* 個拍點/).first()).toBeVisible();
  await page.getByRole('button', { name: '清除全部' }).click(); await expect(page.getByText('0 個拍點')).toBeVisible();
});
