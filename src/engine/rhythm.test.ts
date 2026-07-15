import { lastValueFrom, toArray } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { analyzeRhythm$, makeRegularBeats, readRhythmTemplate } from './rhythm';

describe('rhythm workflow', () => {
  it('creates bounded regular beats and roundtrips a validated template', async () => {
    expect(makeRegularBeats(1_000_000, 120).map(beat => beat.timeUs)).toEqual([0, 500_000, 1_000_000]);
    const file = new File([JSON.stringify({ schemaVersion: 1, name: 'test', durationUs: 1_000_000, beats: [{ id: 'a', timeUs: 0, accent: 1 }] })], 'rhythm.json');
    expect((await readRhythmTemplate(file)).beats).toHaveLength(1);
  });
  it('emits composable progress and result events', async () => {
    const events = await lastValueFrom(analyzeRhythm$(new File(['audio'], 'beat.wav'), { decode: async () => ({ samples: new Float32Array([0, 1]), sampleRate: 100, durationUs: 20_000 }), analyze: async () => [10_000] }).pipe(toArray()));
    expect(events.map(event => event.type)).toEqual(['progress', 'progress', 'result']); expect(events.at(-1)).toMatchObject({ beats: [{ timeUs: 10_000 }] });
  });
  it('runs teardown when unsubscribed', async () => {
    const aborted = vi.fn(); const stream = analyzeRhythm$(new File(['audio'], 'beat.wav'), { decode: async signal => { signal.addEventListener('abort', aborted); return new Promise(() => undefined); }, analyze: async () => [] });
    const subscription = stream.subscribe(); await Promise.resolve(); subscription.unsubscribe(); expect(aborted).toHaveBeenCalledOnce();
  });
});
