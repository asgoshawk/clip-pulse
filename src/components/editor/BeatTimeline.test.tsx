import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BeatTimeline } from './BeatTimeline';

describe('BeatTimeline', () => {
  it('exposes beat controls without rendering one DOM node per pixel', () => {
    const onRemove = vi.fn();
    render(<BeatTimeline durationUs={1_000_000} currentUs={250_000} beats={[{ id: 'a', timeUs: 200_000, accent: 1 }]} onSeek={() => undefined} onMove={() => undefined} onRemove={onRemove} />);
    expect(screen.getByText('1 個片段實例')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('刪除 0.20 秒拍點'));
    expect(onRemove).toHaveBeenCalledWith('a');
  });
});
