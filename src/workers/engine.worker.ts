import { compilePlan } from '@/engine/plan';
import { parseWorkerRequest } from '@/engine/worker-protocol';

const cancelled = new Set<string>();

self.onmessage = async ({ data }: MessageEvent<unknown>) => {
  try {
    const request = parseWorkerRequest(data);
    if (request.type === 'cancel') {
      cancelled.add(request.targetRequestId);
      self.postMessage({ version: 1, requestId: request.requestId, type: 'cancelled' });
      return;
    }
    const plan = await compilePlan(request.sourceStartUs, request.sourceEndUs, request.beats, request.mode);
    if (!cancelled.delete(request.requestId)) self.postMessage({ version: 1, requestId: request.requestId, type: 'plan-ready', plan });
  } catch {
    self.postMessage({ version: 1, requestId: 'unknown', type: 'error', code: 'INVALID_REQUEST', recoverable: true });
  }
};
