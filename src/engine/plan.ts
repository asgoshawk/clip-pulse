import type { MappingMode, RenderPlanV1, RenderSegment } from '@/lib/contracts';

export function compilePlanFallback(sourceStartUs: number, sourceEndUs: number, beats: number[], mode: MappingMode): RenderPlanV1 {
  const clipDuration = sourceEndUs - sourceStartUs;
  if (!Number.isSafeInteger(clipDuration) || clipDuration <= 0 || beats.length > 10_000 || beats.some((beat, index) => index > 0 && beat <= beats[index - 1])) throw new TypeError('無法建立節奏時間軸。');
  const segments: RenderSegment[] = beats.map((start, index) => {
    const end = beats[index + 1] ?? start + clipDuration;
    const interval = end - start;
    const requested = clipDuration / Math.max(1, interval);
    const rate = mode === 'fit' || mode === 'alternate' ? Math.min(3, Math.max(0.5, requested)) : 1;
    const sourceSpan = Math.min(clipDuration, Math.round(interval * rate));
    const reverse = mode === 'alternate' && index % 2 === 1;
    return {
      outputStartUs: start, outputEndUs: end,
      sourceStartUs: reverse ? sourceEndUs - sourceSpan : sourceStartUs,
      sourceEndUs: reverse ? sourceEndUs : sourceStartUs + sourceSpan,
      rate, direction: reverse ? 'reverse' : 'forward', hold: interval > sourceSpan / rate,
    };
  });
  return { schemaVersion: 1, durationUs: segments.at(-1)?.outputEndUs ?? 0, segments };
}

export async function compilePlan(sourceStartUs: number, sourceEndUs: number, beats: number[], mode: MappingMode): Promise<RenderPlanV1> {
  try {
    const wasm = await import('../wasm/clip_pulse_core.js');
    await wasm.default();
    return wasm.compile_plan_js(BigInt(sourceStartUs), BigInt(sourceEndUs), new BigUint64Array(beats.map(BigInt)), mode) as RenderPlanV1;
  } catch {
    return compilePlanFallback(sourceStartUs, sourceEndUs, beats, mode);
  }
}
