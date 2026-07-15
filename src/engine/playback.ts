import type { RenderPlanV1 } from '@/lib/contracts';

export function mapOutputToSourceUs(plan: RenderPlanV1, elapsedUs: number): number {
  const first = plan.segments[0]; if (!first) return 0;
  const span = Math.max(1, plan.durationUs - first.outputStartUs); const outputUs = first.outputStartUs + (Math.max(0, Math.round(elapsedUs)) % span);
  const segment = plan.segments.find(item => outputUs >= item.outputStartUs && outputUs < item.outputEndUs) ?? plan.segments.at(-1)!;
  const elapsed = outputUs - segment.outputStartUs; const sourceSpan = Math.abs(segment.sourceEndUs - segment.sourceStartUs); const travelled = Math.min(sourceSpan, elapsed * segment.rate);
  return Math.round(segment.direction === 'reverse' ? segment.sourceEndUs - travelled : segment.sourceStartUs + travelled);
}
