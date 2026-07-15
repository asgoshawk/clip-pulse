import type { RenderPlanV1 } from '@/lib/contracts';

export interface PlaybackFrame {
  sourceUs: number;
  rate: number;
  shouldPlay: boolean;
  segmentIndex: number;
}

export function resolvePlaybackFrame(plan: RenderPlanV1, elapsedUs: number): PlaybackFrame {
  const first = plan.segments[0];
  if (!first) return { sourceUs: 0, rate: 1, shouldPlay: false, segmentIndex: -1 };
  const span = Math.max(1, plan.durationUs - first.outputStartUs);
  const outputUs = first.outputStartUs + (Math.max(0, Math.round(elapsedUs)) % span);
  const found = plan.segments.findIndex(item => outputUs >= item.outputStartUs && outputUs < item.outputEndUs);
  const segmentIndex = found >= 0 ? found : plan.segments.length - 1;
  const segment = plan.segments[segmentIndex];
  const elapsed = Math.max(0, outputUs - segment.outputStartUs);
  const sourceSpan = Math.abs(segment.sourceEndUs - segment.sourceStartUs);
  const travelled = Math.min(sourceSpan, elapsed * segment.rate);
  const sourceUs = Math.round(segment.direction === 'reverse' ? segment.sourceEndUs - travelled : segment.sourceStartUs + travelled);
  const shouldPlay = segment.direction === 'forward' && elapsed < sourceSpan / Math.max(segment.rate, 0.01);
  return { sourceUs, rate: segment.rate, shouldPlay, segmentIndex };
}

export function mapOutputToSourceUs(plan: RenderPlanV1, elapsedUs: number): number {
  return resolvePlaybackFrame(plan, elapsedUs).sourceUs;
}
