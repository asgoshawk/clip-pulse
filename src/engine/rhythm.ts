import { parseRhythmTemplate, serializeRhythmTemplate, type BeatEvent, type RhythmTemplateV1 } from '@/lib/contracts';

export function makeRegularBeats(durationUs: number, bpm: number): BeatEvent[] {
  if (!Number.isFinite(bpm) || bpm < 30 || bpm > 300) throw new RangeError('BPM 必須介於 30 到 300。');
  const interval = Math.round(60_000_000 / bpm);
  const beats: BeatEvent[] = [];
  for (let timeUs = 0, index = 0; timeUs <= durationUs && index < 10_000; timeUs += interval, index++) {
    beats.push({ id: `beat-${index + 1}`, timeUs, accent: index % 4 === 0 ? 2 : 1 });
  }
  return beats;
}

export async function readRhythmTemplate(file: File): Promise<RhythmTemplateV1> {
  if (file.size > 1_000_000) throw new RangeError('節奏範本不可超過 1 MB。');
  return parseRhythmTemplate(JSON.parse(await file.text()) as unknown);
}

export function downloadRhythmTemplate(name: string, durationUs: number, beats: BeatEvent[]) {
  const json = serializeRhythmTemplate({ schemaVersion: 1, name, durationUs, beats });
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `${name}.clip-pulse.json`; link.click();
  queueMicrotask(() => URL.revokeObjectURL(url));
}
