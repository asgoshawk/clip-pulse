import { AudioSampleSink, BlobSource, Input, MP4, QTFF, WEBM } from 'mediabunny';
import type { RenderPlanV1, RenderSegment } from '@/lib/contracts';

const MAX_DECODED_AUDIO_BYTES = 64 * 1024 * 1024;

export interface DecodedAudioClip {
  startUs: number;
  sampleRate: number;
  channels: Float32Array[];
}

export async function decodeSelectedAudio(file: File, inUs: number, outUs: number, signal?: AbortSignal): Promise<DecodedAudioClip | null> {
  if (signal?.aborted) throw new DOMException('已取消匯出。', 'AbortError');
  const input = new Input({ formats: [MP4, QTFF, WEBM], source: new BlobSource(file, { maxCacheSize: 8 * 1024 * 1024 }) });
  try {
    const track = await input.getPrimaryAudioTrack(); if (signal?.aborted) throw new DOMException('已取消匯出。', 'AbortError');
    if (!track) return null;
    if (!(await track.canDecode())) throw new Error('Chrome 無法解碼來源音訊，無法建立有聲 MP4。');
    const sampleRate = await track.getSampleRate(); const sourceChannelCount = await track.getNumberOfChannels();
    if (!sampleRate || !sourceChannelCount) throw new Error('來源音訊缺少取樣率或聲道資訊。');
    const channelCount = Math.min(2, sourceChannelCount); const frameCount = Math.ceil((outUs - inUs) * sampleRate / 1e6);
    if (frameCount * channelCount * 4 > MAX_DECODED_AUDIO_BYTES) throw new RangeError('選取片段的音訊超過 64 MiB 記憶體上限，請縮短來源片段。');
    const channels = Array.from({ length: channelCount }, () => new Float32Array(frameCount)); const sink = new AudioSampleSink(track); const startSeconds = inUs / 1e6; const endSeconds = outUs / 1e6;
    for await (const sample of sink.samples(startSeconds, endSeconds)) {
      try {
        if (signal?.aborted) throw new DOMException('已取消匯出。', 'AbortError');
        const rawDestinationStart = Math.round((sample.timestamp - startSeconds) * sampleRate); const sourceOffset = Math.max(0, -rawDestinationStart); const destinationStart = Math.max(0, rawDestinationStart); const count = Math.min(sample.numberOfFrames - sourceOffset, frameCount - destinationStart);
        if (count <= 0) continue;
        for (let channel = 0; channel < channelCount; channel++) {
          const values = new Float32Array(count); sample.copyTo(values, { planeIndex: Math.min(channel, sample.numberOfChannels - 1), format: 'f32-planar', frameOffset: sourceOffset, frameCount: count }); channels[channel].set(values, destinationStart);
        }
      } finally { sample.close(); }
    }
    return { startUs: inUs, sampleRate, channels };
  } finally { input.dispose(); }
}

function sampleAt(channel: Float32Array, frame: number) {
  if (!channel.length) return 0;
  const bounded = Math.min(channel.length - 1, Math.max(0, frame)); const before = Math.floor(bounded); const after = Math.min(channel.length - 1, before + 1); const mix = bounded - before;
  return channel[before] * (1 - mix) + channel[after] * mix;
}

function segmentFor(segments: RenderSegment[], outputUs: number, startIndex: number) {
  let index = startIndex;
  while (index < segments.length && outputUs >= segments[index].outputEndUs) index++;
  const segment = segments[index];
  return segment && outputUs >= segment.outputStartUs ? { segment, index } : null;
}

export function renderAudioChunk(clip: DecodedAudioClip, plan: RenderPlanV1 | null, outputStartFrame: number, frameCount: number): Float32Array[] {
  const output = clip.channels.map(() => new Float32Array(frameCount)); const frameUs = 1e6 / clip.sampleRate; let segmentIndex = 0;
  if (plan) while (segmentIndex < plan.segments.length && plan.segments[segmentIndex].outputEndUs <= outputStartFrame * frameUs) segmentIndex++;
  for (let frame = 0; frame < frameCount; frame++) {
    const outputUs = (outputStartFrame + frame) * frameUs; let sourceUs: number;
    if (plan) {
      const resolved = segmentFor(plan.segments, outputUs, segmentIndex); if (!resolved) continue; segmentIndex = resolved.index;
      const { segment } = resolved; const elapsed = outputUs - segment.outputStartUs; const sourceSpan = Math.abs(segment.sourceEndUs - segment.sourceStartUs); if (elapsed >= sourceSpan / Math.max(segment.rate, 0.01)) continue;
      const travelled = elapsed * segment.rate; sourceUs = segment.direction === 'reverse' ? segment.sourceEndUs - travelled : segment.sourceStartUs + travelled;
    } else sourceUs = clip.startUs + outputUs;
    const sourceFrame = (sourceUs - clip.startUs) * clip.sampleRate / 1e6;
    for (let channel = 0; channel < output.length; channel++) output[channel][frame] = sampleAt(clip.channels[channel], sourceFrame);
  }
  return output;
}
