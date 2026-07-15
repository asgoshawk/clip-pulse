import * as v from 'valibot';

const BeatSchema = v.strictObject({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(80)),
  timeUs: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(600_000_000)),
  accent: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(3)),
});

const RhythmTemplateSchema = v.strictObject({
  schemaVersion: v.literal(1),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(80)),
  durationUs: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(600_000_000)),
  beats: v.pipe(v.array(BeatSchema), v.maxLength(10_000)),
});

export type BeatEvent = v.InferOutput<typeof BeatSchema>;
export type RhythmTemplateV1 = v.InferOutput<typeof RhythmTemplateSchema>;
export type MappingMode = 'restart' | 'hold' | 'fit' | 'alternate';

export interface RenderSegment {
  outputStartUs: number;
  outputEndUs: number;
  sourceStartUs: number;
  sourceEndUs: number;
  rate: number;
  direction: 'forward' | 'reverse';
  hold: boolean;
}

export interface RenderPlanV1 {
  schemaVersion: 1;
  durationUs: number;
  segments: RenderSegment[];
}

export function parseRhythmTemplate(input: unknown): RhythmTemplateV1 {
  const value = v.parse(RhythmTemplateSchema, input);
  let previous = -1;
  const ids = new Set<string>();
  for (const beat of value.beats) {
    if (beat.timeUs <= previous || beat.timeUs > value.durationUs) {
      throw new TypeError('拍點必須依序排列，且位於節奏長度內。');
    }
    if (ids.has(beat.id)) throw new TypeError('拍點識別碼不得重複。');
    previous = beat.timeUs;
    ids.add(beat.id);
  }
  return value;
}

export function serializeRhythmTemplate(template: RhythmTemplateV1): string {
  return JSON.stringify(parseRhythmTemplate(template), null, 2);
}
