import { BufferTarget, CanvasSource, Mp4OutputFormat, Output } from 'mediabunny';

export interface ExportOptions { video: HTMLVideoElement; inUs: number; outUs: number; width: number; height: number; signal?: AbortSignal; onProgress?: (value: number) => void }

function seek(video: HTMLVideoElement, seconds: number) {
  return new Promise<void>((resolve, reject) => {
    const done = () => { cleanup(); resolve(); }; const fail = () => { cleanup(); reject(new Error('定位影片影格失敗。')); };
    const cleanup = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', fail); };
    video.addEventListener('seeked', done, { once: true }); video.addEventListener('error', fail, { once: true }); video.currentTime = seconds;
  });
}

export async function exportMp4({ video, inUs, outUs, width, height, signal, onProgress }: ExportOptions): Promise<Blob> {
  if (typeof VideoEncoder === 'undefined') throw new Error('這個瀏覽器不支援 WebCodecs 匯出，請使用最新版 Chrome。');
  const scale = Math.min(1, 1920 / width, 1080 / height);
  const canvas = document.createElement('canvas'); canvas.width = Math.max(2, Math.round(width * scale / 2) * 2); canvas.height = Math.max(2, Math.round(height * scale / 2) * 2);
  const context = canvas.getContext('2d', { alpha: false }); if (!context) throw new Error('無法建立影片畫布。');
  const target = new BufferTarget(); const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
  const source = new CanvasSource(canvas, { codec: 'avc', bitrate: 6_000_000, hardwareAcceleration: 'prefer-hardware' });
  output.addVideoTrack(source, { frameRate: 30 }); await output.start();
  const duration = (outUs - inUs) / 1e6; const frameDuration = 1 / 30; const frames = Math.ceil(duration * 30);
  try {
    for (let index = 0; index < frames; index++) {
      if (signal?.aborted) throw new DOMException('已取消匯出。', 'AbortError');
      const timestamp = index * frameDuration; await seek(video, inUs / 1e6 + timestamp);
      context.drawImage(video, 0, 0, canvas.width, canvas.height); await source.add(timestamp, Math.min(frameDuration, duration - timestamp), { keyFrame: index % 60 === 0 });
      onProgress?.((index + 1) / frames);
    }
    await output.finalize(); if (!target.buffer) throw new Error('匯出結果為空。'); return new Blob([target.buffer], { type: 'video/mp4' });
  } catch (error) { if (output.state === 'started') await output.cancel(); throw error; }
}
