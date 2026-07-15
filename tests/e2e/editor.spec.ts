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
  await expect(page.getByRole('heading', { name: '選取要重複的動作' })).toBeVisible(); await expect(page.getByText('來源片段預覽')).toBeVisible();
  const volume = page.getByRole('slider', { name: '預覽音量', exact: true }); await expect(volume).toHaveValue('0.8'); await volume.fill('0.35'); await expect(page.locator('video')).toHaveJSProperty('volume', 0.35); await expect(page.locator('video')).toHaveJSProperty('muted', false);
  const end = page.getByLabel('終點時間'); await end.fill('0.20'); await end.press('Enter'); await expect(end).toHaveValue('00.200');
  await page.getByRole('button', { name: '循環預覽這個片段' }).click(); await expect(page.getByRole('status')).toHaveText('正在循環預覽來源片段'); await page.waitForTimeout(350);
  expect(await page.locator('video').evaluate(element => (element as HTMLVideoElement).currentTime)).toBeLessThanOrEqual(0.23);
  await page.getByRole('button', { name: '停止範圍預覽' }).click(); await expect(page.getByRole('status')).toHaveText('預覽已停止');
});
test('creates, removes, and previews beats with an explicit output duration', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  const start = page.getByLabel('起點時間'); const end = page.getByLabel('終點時間'); await end.fill('0.20'); await end.press('Enter'); await start.fill('0.50'); await start.press('Enter'); await expect(end).toHaveValue('00.700'); await page.getByRole('button', { name: '使用這段動作' }).click(); await expect(page.getByRole('heading', { name: '編排成品' })).toBeVisible(); await expect(page.getByRole('heading', { name: '三步完成節奏編排' })).toBeVisible(); await expect(page.getByText('已在 0 秒放入第一個片段，目前共有 1 個。')).toBeVisible();
  const duration = page.getByLabel('成品總長度'); await duration.fill('1.20'); await duration.press('Enter'); await expect(duration).toHaveValue('01.200'); await page.getByLabel('成品播放位置').fill('500000'); await page.getByRole('button', { name: '在此加入片段 Space' }).click(); await expect(page.getByText('2 個片段實例', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '播放成品預覽' })).toBeEnabled(); await page.getByRole('button', { name: '播放成品預覽' }).click(); await expect(page.getByRole('status')).toHaveText('正在預覽成品時間軸'); await page.waitForTimeout(80); await expect(page.locator('video')).toHaveJSProperty('paused', false); await page.waitForTimeout(340);
  expect(Number(await page.getByLabel('成品播放位置').inputValue())).toBeGreaterThan(500_000);
  const sourceTime = await page.locator('video').evaluate(videoElement => (videoElement as HTMLVideoElement).currentTime);
  expect(sourceTime).toBeGreaterThanOrEqual(0.49); expect(sourceTime).toBeLessThanOrEqual(0.72);
  await page.getByRole('button', { name: '暫停預覽' }).click(); await expect(page.getByRole('status')).toHaveText('預覽已停止');
  await page.getByRole('button', { name: /刪除 .*秒拍點/ }).last().click(); await expect(page.getByText('1 個片段實例', { exact: true })).toBeVisible(); await expect(page.getByText(/成品：1.20 秒 · 1 個片段實例/)).toBeVisible();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: '匯出 MP4' }).click(); const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('clip-pulse.mp4'); const path = await download.path(); expect(path).toBeTruthy();
  const bytes = await import('node:fs/promises').then(fs => fs.readFile(path!)); expect(bytes.length).toBeGreaterThan(1_000); expect(bytes.subarray(4, 8).toString()).toBe('ftyp');
});
test('analyzes uploaded reference audio locally and creates editable beats', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  await page.getByRole('button', { name: '使用這段動作' }).click();
  await page.getByLabel('參考節奏音訊').setInputFiles({ name: 'pulse.wav', mimeType: 'audio/wav', buffer: createPulseWav() });
  await expect(page.getByRole('status').filter({ hasText: '找到' })).toContainText(/找到 [1-9][0-9]* 個拍點/); await expect(page.getByText(/[1-9][0-9]* 個片段實例/).first()).toBeVisible();
  await page.getByRole('button', { name: '清除全部' }).click(); await expect(page.getByText('0 個片段實例', { exact: true })).toBeVisible();
});
