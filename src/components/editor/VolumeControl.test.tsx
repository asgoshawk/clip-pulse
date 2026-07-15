import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VolumeControl } from './VolumeControl';

describe('VolumeControl', () => {
  it('exposes immediate mute and volume controls', () => {
    const onMutedChange = vi.fn(); const onVolumeChange = vi.fn();
    render(<VolumeControl muted={false} volume={0.8} onMutedChange={onMutedChange} onVolumeChange={onVolumeChange} />);
    fireEvent.click(screen.getByRole('button', { name: '靜音' }));
    fireEvent.change(screen.getByLabelText('預覽音量'), { target: { value: '0.35' } });
    expect(onMutedChange).toHaveBeenCalledWith(true);
    expect(onVolumeChange).toHaveBeenCalledWith(0.35);
  });
});
