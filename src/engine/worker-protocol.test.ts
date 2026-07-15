import { describe, expect, it } from 'vitest';
import { parseWorkerRequest } from './worker-protocol';

describe('parseWorkerRequest', () => {
  it('accepts a bounded compile request', () => {
    expect(parseWorkerRequest({ version: 1, requestId: 'r1', type: 'compile-plan', sourceStartUs: 0, sourceEndUs: 1_000_000, beats: [0], mode: 'restart' }).type).toBe('compile-plan');
  });

  it('rejects unknown and oversized messages', () => {
    expect(() => parseWorkerRequest({ version: 2, requestId: 'r1', type: 'compile-plan' })).toThrow();
    expect(() => parseWorkerRequest({ version: 1, requestId: 'r1', type: 'compile-plan', sourceStartUs: 0, sourceEndUs: 1, beats: Array.from({ length: 10_001 }, (_, i) => i), mode: 'restart' })).toThrow();
  });
});
