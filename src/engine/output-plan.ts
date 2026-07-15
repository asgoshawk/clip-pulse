import type { RenderPlanV1 } from '@/lib/contracts';

export function fitPlanToDuration(plan: RenderPlanV1, durationUs: number): RenderPlanV1 {
  if (!Number.isSafeInteger(durationUs) || durationUs <= 0 || durationUs > 600_000_000) throw new RangeError('輸出長度必須介於 0 到 10 分鐘。');
  if (!plan.segments.length || plan.durationUs <= 0) return { schemaVersion: 1, durationUs, segments: [] };
  const segments = plan.segments.filter(segment => segment.outputStartUs < durationUs).map(segment => ({ ...segment, outputEndUs: Math.min(durationUs, segment.outputEndUs) }));
  return { schemaVersion: 1, durationUs, segments };
}
