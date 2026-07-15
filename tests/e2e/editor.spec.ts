import { expect, test } from '@playwright/test';

async function createVideoFixture(page: import('@playwright/test').Page) {
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 180;
    const context = canvas.getContext('2d')!; const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' }); const chunks: Blob[] = [];
    recorder.ondataavailable = event => chunks.push(event.data); recorder.start();
    for (let frame = 0; frame < 24; frame++) { context.fillStyle = frame % 2 ? '#f59e0b' : '#18181b'; context.fillRect(0, 0, 320, 180); context.fillStyle = '#fff'; context.fillRect(frame * 10, 70, 30, 30); await new Promise(resolve => setTimeout(resolve, 34)); }
    const stopped = new Promise<void>(resolve => recorder.onstop = () => resolve()); recorder.stop(); await stopped; stream.getTracks().forEach(track => track.stop());
    return Array.from(new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer()));
  });
  return Buffer.from(bytes);
}

function createPulseWav() {
  const sampleRate = 8_000; const samples = new Int16Array(sampleRate); for (const second of [0.1, 0.5]) for (let index = 0; index < 80; index++) samples[Math.round(second * sampleRate) + index] = index < 40 ? 28_000 : -28_000;
  const buffer = Buffer.alloc(44 + samples.byteLength); buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + samples.byteLength, 4); buffer.write('WAVEfmt ', 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(samples.byteLength, 40); Buffer.from(samples.buffer).copy(buffer, 44); return buffer;
}
test('shows the private local-first entry experience', async ({ page }) => { const requests:string[]=[]; page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))requests.push(r.url())}); await page.goto('./'); await expect(page.getByRole('heading',{name:'讓動作跟著節奏跳動'})).toBeVisible(); await expect(page.getByText('檔案只在這台裝置處理，不會上傳。')).toBeVisible(); expect(requests).toEqual([]); });
test('opens the native file chooser from the visible button', async ({ page }) => {
  await page.goto('./');
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '選擇影片', exact: true }).click();
  const chooser = await chooserPromise;
  expect(chooser.isMultiple()).toBe(false);
});
test('rejects an unsupported file defensively', async ({ page }) => { await page.goto('./'); await page.getByLabel('影片檔案').setInputFiles({name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('no')}); await expect(page.getByRole('alert')).toContainText('MP4 或 MOV'); });
test('loads a real browser video and supports playback and live tapping', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page);
  const chooserPromise = page.waitForEvent('filechooser'); await page.getByRole('button', { name: '選擇影片', exact: true }).click();
  await (await chooserPromise).setFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  await expect(page.getByRole('heading', { name: '動作片段' })).toBeVisible();
  await expect(page.getByText(/320 × 180/)).toBeVisible();
  await page.getByRole('button', { name: '播放' }).click(); await expect(page.getByRole('button', { name: '暫停' })).toBeVisible();
  await page.keyboard.press('Space'); await expect(page.getByText('1 個拍點')).toBeVisible();
});
test('uses the WASM render plan to keep rhythm preview inside the selected clip', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  await expect(page.getByRole('heading', { name: '動作片段' })).toBeVisible(); await page.getByLabel('終點（秒）').fill('0.20');
  await page.getByRole('button', { name: '建立拍點' }).click(); await expect(page.getByText(/WASM 節奏規劃：[1-9]/)).toBeVisible();
  await page.getByRole('button', { name: '播放' }).click(); await expect(page.getByText('節奏預覽中')).toBeVisible(); await page.waitForTimeout(420);
  const sourceTime = await page.locator('video').evaluate(videoElement => (videoElement as HTMLVideoElement).currentTime);
  expect(sourceTime).toBeGreaterThanOrEqual(0); expect(sourceTime).toBeLessThanOrEqual(0.22);
  await page.getByRole('button', { name: '暫停' }).click(); await expect(page.getByText('節奏預覽中')).toBeHidden();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: '匯出 MP4' }).click(); const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('clip-pulse.mp4'); const path = await download.path(); expect(path).toBeTruthy();
  const bytes = await import('node:fs/promises').then(fs => fs.readFile(path!)); expect(bytes.length).toBeGreaterThan(1_000); expect(bytes.subarray(4, 8).toString()).toBe('ftyp');
});
test('analyzes uploaded reference audio locally and creates editable beats', async ({ page }) => {
  await page.goto('./'); const video = await createVideoFixture(page); await page.getByLabel('影片檔案').setInputFiles({ name: 'fixture.mp4', mimeType: 'video/mp4', buffer: video });
  await page.getByLabel('參考節奏音訊').setInputFiles({ name: 'pulse.wav', mimeType: 'audio/wav', buffer: createPulseWav() });
  await expect(page.getByRole('status')).toContainText(/找到 [1-9][0-9]* 個拍點/); await expect(page.getByText(/[1-9][0-9]* 個拍點/).first()).toBeVisible();
  await expect(page.getByText(/WASM 節奏規劃：[1-9]/)).toBeVisible();
});
