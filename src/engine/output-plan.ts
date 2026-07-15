import type { RenderPlanV1, RenderSegment } from '@/lib/contracts';

export function fitPlanToDuration(plan: RenderPlanV1, durationUs: number): RenderPlanV1 {
  if (!Number.isSafeInteger(durationUs) || durationUs <= 0 || durationUs > 600_000_000) throw new RangeError('輸出長度必須介於 0 到 10 分鐘。');
  if (!plan.segments.length || plan.durationUs <= 0) return { schemaVersion: 1, durationUs, segments: [] };
  const segments: RenderSegment[] = []; for (let offset = 0; offset < durationUs && segments.length < 10_000; offset += plan.durationUs) for (const segment of plan.segments) { const start = offset + segment.outputStartUs; if (start >= durationUs) break; segments.push({ ...segment, outputStartUs: start, outputEndUs: Math.min(durationUs, offset + segment.outputEndUs) }); }
  return { schemaVersion: 1, durationUs, segments };
}
