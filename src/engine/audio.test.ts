import { describe, expect, it } from 'vitest';
import type { RenderPlanV1 } from '@/lib/contracts';
import { renderAudioChunk, type DecodedAudioClip } from './audio';

const clip: DecodedAudioClip = {
  startUs: 100_000,
  sampleRate: 10,
  channels: [new Float32Array([0, 1, 2, 3])],
};

describe('renderAudioChunk', () => {
  it('restarts source audio and emits silence while a frame is held', () => {
    const plan: RenderPlanV1 = { schemaVersion: 1, durationUs: 800_000, segments: [
      { outputStartUs: 0, outputEndUs: 400_000, sourceStartUs: 100_000, sourceEndUs: 300_000, rate: 1, direction: 'forward', hold: true },
      { outputStartUs: 400_000, outputEndUs: 800_000, sourceStartUs: 100_000, sourceEndUs: 300_000, rate: 1, direction: 'forward', hold: true },
    ] };
    expect(Array.from(renderAudioChunk(clip, plan, 0, 8)[0])).toEqual([0, 1, 0, 0, 0, 1, 0, 0]);
  });

  it('renders reverse segments without mutating decoded source samples', () => {
    const plan: RenderPlanV1 = { schemaVersion: 1, durationUs: 300_000, segments: [
      { outputStartUs: 0, outputEndUs: 300_000, sourceStartUs: 100_000, sourceEndUs: 400_000, rate: 1, direction: 'reverse', hold: false },
    ] };
    const frozen = Array.from(clip.channels[0]);
    expect(Array.from(renderAudioChunk(clip, plan, 0, 3)[0])).toEqual([3, 2, 1]);
    expect(Array.from(clip.channels[0])).toEqual(frozen);
  });
});
