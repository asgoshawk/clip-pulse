export interface CapabilityReport {
  secureContext: boolean;
  wasm: boolean;
  webGpu: boolean;
  videoDecode: boolean;
  videoEncode: boolean;
  fileSystemAccess: boolean;
  status: 'accelerated' | 'compatible' | 'preview-only' | 'blocked';
}

export async function detectCapabilities(): Promise<CapabilityReport> {
  const secureContext = globalThis.isSecureContext ?? false;
  const wasm = typeof WebAssembly === 'object';
  const webGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
  const videoDecode = typeof globalThis.VideoDecoder === 'function';
  let videoEncode = typeof globalThis.VideoEncoder === 'function';
  if (videoEncode) {
    try {
      videoEncode = (await VideoEncoder.isConfigSupported({ codec: 'avc1.42001f', width: 1280, height: 720, framerate: 30, bitrate: 4_000_000, hardwareAcceleration: 'prefer-hardware' })).supported === true;
    } catch { videoEncode = false; }
  }
  const fileSystemAccess = typeof window !== 'undefined' && 'showSaveFilePicker' in window;
  const status = !wasm ? 'blocked' : videoEncode && webGpu ? 'accelerated' : videoEncode ? 'compatible' : 'preview-only';
  return { secureContext, wasm, webGpu, videoDecode, videoEncode, fileSystemAccess, status };
}
