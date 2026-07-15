import { describe, expect, it } from 'vitest';
import { mapOutputToSourceUs } from './playback';
import type { RenderPlanV1 } from '@/lib/contracts';

const plan: RenderPlanV1 = { schemaVersion: 1, durationUs: 1_000_000, segments: [
  { outputStartUs: 0, outputEndUs: 500_000, sourceStartUs: 100_000, sourceEndUs: 300_000, rate: 1, direction: 'forward', hold: true },
  { outputStartUs: 500_000, outputEndUs: 1_000_000, sourceStartUs: 100_000, sourceEndUs: 300_000, rate: 1, direction: 'reverse', hold: true },
] };

describe('mapOutputToSourceUs', () => {
  it('maps forward, hold, reverse, and loop without mutation', () => {
    const frozen = structuredClone(plan); expect(mapOutputToSourceUs(plan, 50_000)).toBe(150_000);
    expect(mapOutputToSourceUs(plan, 400_000)).toBe(300_000); expect(mapOutputToSourceUs(plan, 550_000)).toBe(250_000);
    expect(mapOutputToSourceUs(plan, 1_050_000)).toBe(150_000); expect(plan).toEqual(frozen);
  });
  it('returns zero for an empty plan', () => expect(mapOutputToSourceUs({ schemaVersion: 1, durationUs: 0, segments: [] }, 10)).toBe(0));
});
