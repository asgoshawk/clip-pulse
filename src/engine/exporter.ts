import { AudioBufferSource, BufferTarget, CanvasSource, Mp4OutputFormat, Output } from 'mediabunny';
import type { RenderPlanV1 } from '@/lib/contracts';
import { decodeSelectedAudio, renderAudioChunk } from './audio';
import { mapOutputToSourceUs } from './playback';

export interface ExportOptions { file: File; video: HTMLVideoElement; inUs: number; outUs: number; width: number; height: number; renderPlan?: RenderPlanV1 | null; signal?: AbortSignal; onProgress?: (value: number) => void }

function seek(video: HTMLVideoElement, seconds: number) {
  return new Promise<void>((resolve, reject) => {
    const done = () => { cleanup(); resolve(); }; const fail = () => { cleanup(); reject(new Error('定位影片影格失敗。')); };
    const cleanup = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', fail); };
    video.addEventListener('seeked', done, { once: true }); video.addEventListener('error', fail, { once: true }); video.currentTime = seconds;
  });
}

export async function exportMp4({ file, video, inUs, outUs, width, height, renderPlan, signal, onProgress }: ExportOptions): Promise<Blob> {
  if (typeof VideoEncoder === 'undefined') throw new Error('這個瀏覽器不支援 WebCodecs 匯出，請使用最新版 Chrome。');
  const audioClip = await decodeSelectedAudio(file, inUs, outUs, signal); if (audioClip && typeof AudioEncoder === 'undefined') throw new Error('這個瀏覽器不支援 AAC 音訊匯出，請使用最新版 Chrome。');
  const scale = Math.min(1, 1920 / width, 1080 / height);
  const canvas = document.createElement('canvas'); canvas.width = Math.max(2, Math.round(width * scale / 2) * 2); canvas.height = Math.max(2, Math.round(height * scale / 2) * 2);
  const context = canvas.getContext('2d', { alpha: false }); if (!context) throw new Error('無法建立影片畫布。');
  const target = new BufferTarget(); const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
  const source = new CanvasSource(canvas, { codec: 'avc', bitrate: 6_000_000, hardwareAcceleration: 'prefer-hardware' });
  const audioSource = audioClip ? new AudioBufferSource({ codec: 'aac', bitrate: 128_000 }) : null;
  output.addVideoTrack(source, { frameRate: 30 }); if (audioSource) output.addAudioTrack(audioSource); await output.start();
  const duration = renderPlan?.segments.length ? renderPlan.durationUs / 1e6 : (outUs - inUs) / 1e6; const frameDuration = 1 / 30; const frames = Math.ceil(duration * 30);
  let videoProgress = 0; let audioProgress = audioClip ? 0 : 1; let siblingFailed = false; const report = () => onProgress?.(0.05 + videoProgress * 0.8 + audioProgress * 0.15); const ensureActive = () => { if (signal?.aborted || siblingFailed) throw new DOMException('已取消匯出。', 'AbortError'); };
  try {
    const renderVideo = async () => { for (let index = 0; index < frames; index++) { ensureActive(); const timestamp = index * frameDuration; const sourceUs = renderPlan?.segments.length ? mapOutputToSourceUs(renderPlan, timestamp * 1e6) : inUs + timestamp * 1e6; await seek(video, sourceUs / 1e6); context.drawImage(video, 0, 0, canvas.width, canvas.height); await source.add(timestamp, Math.min(frameDuration, duration - timestamp), { keyFrame: index % 60 === 0 }); videoProgress = (index + 1) / frames; report(); } };
    const renderAudio = async () => { if (!audioClip || !audioSource) return; const totalFrames = Math.ceil(duration * audioClip.sampleRate); const chunkFrames = audioClip.sampleRate; for (let start = 0; start < totalFrames; start += chunkFrames) { ensureActive(); const count = Math.min(chunkFrames, totalFrames - start); const channels = renderAudioChunk(audioClip, renderPlan?.segments.length ? renderPlan : null, start, count); const buffer = new AudioBuffer({ numberOfChannels: channels.length, length: count, sampleRate: audioClip.sampleRate }); channels.forEach((values, channel) => buffer.getChannelData(channel).set(values)); await audioSource.add(buffer); audioProgress = (start + count) / totalFrames; report(); } };
    const guarded = async (task: () => Promise<void>) => { try { await task(); } catch (error) { siblingFailed = true; throw error; } }; const results = await Promise.allSettled([guarded(renderVideo), guarded(renderAudio)]); const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected'); if (failures.length) throw failures.find(failure => !(failure.reason instanceof DOMException && failure.reason.name === 'AbortError'))?.reason ?? failures[0].reason;
    await output.finalize(); if (!target.buffer) throw new Error('匯出結果為空。'); return new Blob([target.buffer], { type: 'video/mp4' });
  } catch (error) { if (output.state === 'started') await output.cancel(); throw error; }
}
