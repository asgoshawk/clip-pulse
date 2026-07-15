import { describe, expect, it, vi } from 'vitest';
import { detectCapabilities } from './capabilities';

describe('detectCapabilities', () => {
  it('never claims export when VideoEncoder is absent', async () => {
    vi.stubGlobal('VideoEncoder', undefined);
    const report = await detectCapabilities();
    expect(report.status).toBe('preview-only');
    expect(report.videoEncode).toBe(false);
    vi.unstubAllGlobals();
  });
});
