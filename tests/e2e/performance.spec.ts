import { expect, test } from '@playwright/test';

test('stays within startup budgets and makes no third-party requests', async ({ page }) => {
  const thirdParty: string[] = []; page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1')) thirdParty.push(request.url()); }); await page.goto('./'); await page.waitForLoadState('networkidle');
  const metrics = await page.evaluate(() => ({ transfer: performance.getEntriesByType('resource').reduce((sum, entry) => sum + ((entry as PerformanceResourceTiming).transferSize || 0), 0), heap: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0 }));
  expect(thirdParty).toEqual([]); expect(metrics.transfer).toBeLessThan(2_000_000); if (metrics.heap) expect(metrics.heap).toBeLessThan(80_000_000);
});

test('revokes every object URL after malformed media failures', async ({ page }) => {
  await page.addInitScript(() => { const state = { created: 0, revoked: 0 }; const create = URL.createObjectURL.bind(URL); const revoke = URL.revokeObjectURL.bind(URL); URL.createObjectURL = blob => { state.created++; return create(blob); }; URL.revokeObjectURL = url => { state.revoked++; return revoke(url); }; Object.defineProperty(window, '__urlMetrics', { value: state }); }); await page.goto('./');
  for (let index = 0; index < 3; index++) { await page.getByLabel('影片檔案').setInputFiles({ name: `broken-${index}.mp4`, mimeType: 'video/mp4', buffer: Buffer.from('not media') }); await expect(page.getByRole('alert')).toBeVisible(); }
  await expect.poll(() => page.evaluate(() => (window as unknown as { __urlMetrics: { created: number; revoked: number } }).__urlMetrics)).toEqual({ created: 3, revoked: 3 });
});
