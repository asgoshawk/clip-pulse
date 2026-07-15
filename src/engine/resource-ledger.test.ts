import { describe, expect, it, vi } from 'vitest';
import { ResourceLedger } from './resource-ledger';

describe('ResourceLedger', () => {
  it('releases in reverse order once even when cleanup throws', async () => {
    const order: number[] = [];
    const ledger = new ResourceLedger();
    ledger.track(() => { order.push(1); });
    ledger.track(() => { order.push(2); throw new Error('expected'); });
    ledger.track(async () => { order.push(3); });
    await ledger.release();
    await ledger.release();
    expect(order).toEqual([3, 2, 1]);
  });

  it('revokes tracked object URLs', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const ledger = new ResourceLedger();
    ledger.trackObjectUrl('blob:test');
    await ledger.release();
    expect(revoke).toHaveBeenCalledWith('blob:test');
  });
});
