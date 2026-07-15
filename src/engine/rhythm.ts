import { parseRhythmTemplate, serializeRhythmTemplate, type BeatEvent, type RhythmTemplateV1 } from '@/lib/contracts';
import { Observable } from 'rxjs';

export type RhythmAnalysisEvent = { type: 'progress'; phase: 'decoding' | 'analyzing'; progress: number } | { type: 'result'; beats: BeatEvent[]; durationUs: number };
type DecodedAudio = { samples: Float32Array; sampleRate: number; durationUs: number };
type AnalysisDependencies = { decode?: (signal: AbortSignal) => Promise<DecodedAudio>; analyze?: (samples: Float32Array, sampleRate: number) => Promise<number[]> };

async function decodeAudio(file: File, signal: AbortSignal): Promise<DecodedAudio> {
  if (!file.size || file.size > 50 * 1024 * 1024) throw new RangeError('參考音訊必須小於 50 MB，且不可為空檔案。');
  const context = new AudioContext(); const close = () => context.state === 'closed' ? Promise.resolve() : context.close().catch(() => undefined); signal.addEventListener('abort', () => { void close(); }, { once: true });
  try { const buffer = await context.decodeAudioData(await file.arrayBuffer()); if (signal.aborted) throw new DOMException('已取消分析。', 'AbortError'); if (buffer.duration > 600) throw new RangeError('參考音訊不可超過 10 分鐘。'); const samples = new Float32Array(buffer.length); for (let channel = 0; channel < buffer.numberOfChannels; channel++) { const data = buffer.getChannelData(channel); for (let index = 0; index < data.length; index++) samples[index] += data[index] / buffer.numberOfChannels; } return { samples, sampleRate: buffer.sampleRate, durationUs: Math.round(buffer.duration * 1e6) }; } finally { await close(); }
}

async function analyzeOnsets(samples: Float32Array, sampleRate: number): Promise<number[]> {
  try { const wasm = await import('../wasm/clip_pulse_core.js'); await wasm.default(); return Array.from(wasm.analyze_onsets_js(samples, sampleRate), Number); } catch { const windowSize = Math.max(1, Math.floor(sampleRate / 100)); const energies: number[] = []; for (let offset = 0; offset < samples.length; offset += windowSize) { let sum = 0; for (let index = offset; index < Math.min(samples.length, offset + windowSize); index++) sum += Math.abs(samples[index]); energies.push(sum / Math.min(windowSize, samples.length - offset)); } const mean = energies.reduce((sum, value) => sum + value, 0) / Math.max(1, energies.length); return energies.flatMap((energy, index) => energy > mean * 1.8 && (energies[index - 1] ?? 0) <= mean * 1.8 ? [Math.round(index * windowSize * 1e6 / sampleRate)] : []); }
}

export function analyzeRhythm$(file: File, dependencies: AnalysisDependencies = {}): Observable<RhythmAnalysisEvent> {
  return new Observable(subscriber => { const controller = new AbortController(); void (async () => { try { subscriber.next({ type: 'progress', phase: 'decoding', progress: 0.1 }); const decoded = await (dependencies.decode ? dependencies.decode(controller.signal) : decodeAudio(file, controller.signal)); if (controller.signal.aborted) return; subscriber.next({ type: 'progress', phase: 'analyzing', progress: 0.65 }); const times = await (dependencies.analyze ?? analyzeOnsets)(decoded.samples, decoded.sampleRate); if (controller.signal.aborted) return; subscriber.next({ type: 'result', durationUs: decoded.durationUs, beats: times.slice(0, 10_000).filter(timeUs => timeUs <= decoded.durationUs).map((timeUs, index) => ({ id: `audio-${index + 1}`, timeUs: Math.round(timeUs), accent: index % 4 === 0 ? 2 : 1 })) }); subscriber.complete(); } catch (error) { if (!controller.signal.aborted) subscriber.error(error); } })(); return () => controller.abort(); });
}

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
