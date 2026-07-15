import type { MappingMode } from '@/lib/contracts';

export type CompilePlanRequest = {
  version: 1;
  requestId: string;
  type: 'compile-plan';
  sourceStartUs: number;
  sourceEndUs: number;
  beats: number[];
  mode: MappingMode;
};

export type CancelRequest = { version: 1; requestId: string; type: 'cancel'; targetRequestId: string };
export type WorkerRequest = CompilePlanRequest | CancelRequest;

function safeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 600_000_000;
}

export function parseWorkerRequest(input: unknown): WorkerRequest {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('無效的 Worker 訊息。');
  const value = input as Record<string, unknown>;
  if (value.version !== 1 || typeof value.requestId !== 'string' || value.requestId.length > 80) throw new TypeError('不支援的 Worker 訊息版本。');
  if (value.type === 'cancel') {
    if (typeof value.targetRequestId !== 'string') throw new TypeError('取消目標無效。');
    return input as CancelRequest;
  }
  if (value.type !== 'compile-plan' || !safeInteger(value.sourceStartUs) || !safeInteger(value.sourceEndUs) || value.sourceStartUs >= value.sourceEndUs) throw new TypeError('編譯參數無效。');
  if (!Array.isArray(value.beats) || value.beats.length > 10_000 || !value.beats.every(safeInteger)) throw new TypeError('拍點資料無效。');
  if (!['restart', 'hold', 'fit', 'alternate'].includes(String(value.mode))) throw new TypeError('映射模式無效。');
  return input as CompilePlanRequest;
}
