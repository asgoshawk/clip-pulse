export interface MediaInfo {
  name: string;
  url: string;
  durationUs: number;
  width: number;
  height: number;
  frameDurationUs: number;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024 * 1024;
const MAX_DURATION_SECONDS = 600;

export async function inspectMedia(file: File): Promise<MediaInfo> {
  if (!/\.(mp4|mov)$/i.test(file.name) && !['video/mp4', 'video/quicktime'].includes(file.type)) {
    throw new TypeError('請選擇 MP4 或 MOV 影片。');
  }
  if (!file.size || file.size > MAX_FILE_BYTES) throw new RangeError('影片必須小於 4 GB，且不可為空檔案。');
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  try {
    const loaded = new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('讀取影片逾時。')), 15_000);
      video.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
      video.onerror = () => { clearTimeout(timeout); reject(new Error('瀏覽器無法解碼這部影片。')); };
    });
    video.src = url;
    await loaded;
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > MAX_DURATION_SECONDS) {
      throw new RangeError('MVP 支援最長 10 分鐘的影片。');
    }
    return { name: file.name, url, durationUs: Math.round(video.duration * 1e6), width: video.videoWidth, height: video.videoHeight, frameDurationUs: 33_333 };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  } finally {
    video.removeAttribute('src');
    video.load();
  }
}

export function releaseMedia(media: MediaInfo | null) {
  if (media) URL.revokeObjectURL(media.url);
}
