import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { BeatEvent } from '@/lib/contracts';

type Props = { durationUs: number; currentUs: number; beats: BeatEvent[]; onSeek: (timeUs: number) => void; onMove: (id: string, timeUs: number) => void; onRemove: (id: string) => void };

export function BeatTimeline({ durationUs, currentUs, beats, onSeek, onMove, onRemove }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1); const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, rect.width * ratio); canvas.height = 112 * ratio;
    const context = canvas.getContext('2d'); if (!context) return; context.scale(ratio, ratio);
    context.fillStyle = '#18181b'; context.fillRect(0, 0, rect.width, 112);
    context.strokeStyle = '#3f3f46';
    for (let i = 0; i <= 10; i++) { const x = rect.width * i / 10; context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 112); context.stroke(); }
    for (const beat of beats) { const x = durationUs ? rect.width * beat.timeUs / durationUs : 0; context.fillStyle = beat.accent > 1 ? '#fbbf24' : '#f59e0b'; context.fillRect(x - 1, 14, 2, 82); }
    const playX = durationUs ? rect.width * currentUs / durationUs : 0; context.fillStyle = '#fafafa'; context.fillRect(playX - 1, 0, 2, 112);
  }, [beats, currentUs, durationUs]);
  const seek = (clientX: number) => { const rect = canvasRef.current?.getBoundingClientRect(); if (rect) onSeek(Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * durationUs)); };
  return <section aria-label="節奏時間軸" className="border-t border-zinc-800 bg-zinc-950 p-4">
    <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-medium">節奏時間軸</h2><span className="text-xs text-zinc-500">{beats.length} 個拍點</span></div>
    <canvas ref={canvasRef} className="h-28 w-full rounded-lg" onPointerDown={(event) => seek(event.clientX)} />
    <div className="mt-3 flex min-h-8 gap-2 overflow-x-auto">
      {beats.map((beat) => <div key={beat.id} className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs">
        <input aria-label={`移動 ${ (beat.timeUs / 1_000_000).toFixed(2) } 秒拍點`} className="w-16 bg-transparent" type="number" step="0.01" value={(beat.timeUs / 1_000_000).toFixed(2)} onChange={(event) => onMove(beat.id, Number(event.target.value) * 1_000_000)} />
        <button aria-label={`刪除 ${(beat.timeUs / 1_000_000).toFixed(2)} 秒拍點`} onClick={() => onRemove(beat.id)}><X size={13} /></button>
      </div>)}
    </div>
  </section>;
}
