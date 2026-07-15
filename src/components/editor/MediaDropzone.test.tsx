import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaDropzone } from './MediaDropzone';

describe('MediaDropzone', () => {
  it('explains local-only processing and accepts a video', () => {
    const onFile = vi.fn();
    render(<MediaDropzone busy={false} onFile={onFile} />);
    expect(screen.getByText(/不會上傳/)).toBeInTheDocument();
    const file = new File(['video'], 'bird.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByLabelText('選擇影片檔案'), { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('does not accept a non-video extension', () => {
    const onFile = vi.fn();
    render(<MediaDropzone busy={false} onFile={onFile} />);
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('選擇影片檔案'), { target: { files: [file] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('MP4 或 MOV');
  });
});
