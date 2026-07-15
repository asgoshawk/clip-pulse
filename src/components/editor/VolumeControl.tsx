import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  muted: boolean;
  volume: number;
  onMutedChange: (muted: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

export function VolumeControl({ muted, volume, onMutedChange, onVolumeChange }: Props) {
  const audible = !muted && volume > 0;
  return <div className="group flex items-center gap-1" aria-label="預覽音量控制">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={audible ? '靜音' : '開啟聲音'}
      onClick={() => onMutedChange(audible)}
    >
      {audible ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </Button>
    <input
      aria-label="預覽音量"
      className="w-20 accent-amber-400 sm:w-24"
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={muted ? 0 : volume}
      onChange={event => onVolumeChange(Number(event.target.value))}
    />
  </div>;
}
