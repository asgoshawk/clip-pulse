import { describe, expect, it } from 'vitest';
import { fitPlanToDuration } from './output-plan';
import type { RenderPlanV1 } from '@/lib/contracts';

const plan: RenderPlanV1 = { schemaVersion: 1, durationUs: 500_000, segments: [{ outputStartUs: 0, outputEndUs: 500_000, sourceStartUs: 0, sourceEndUs: 200_000, rate: 1, direction: 'forward', hold: true }] };
describe('fitPlanToDuration', () => {
  it('trims without inventing unmarked clip instances', () => { const original = structuredClone(plan); expect(fitPlanToDuration(plan, 250_000).durationUs).toBe(250_000); const extended = fitPlanToDuration(plan, 1_200_000); expect(extended.durationUs).toBe(1_200_000); expect(extended.segments).toHaveLength(1); expect(plan).toEqual(original); });
  it('rejects unsafe durations', () => expect(() => fitPlanToDuration(plan, 0)).toThrow());
});
