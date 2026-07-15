import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { BeatEvent } from '@/lib/contracts';

type Props = { durationUs: number; currentUs: number; beats: BeatEvent[]; selection?: { inUs: number; outUs: number }; onSeek: (timeUs: number) => void; onMove: (id: string, timeUs: number) => void; onRemove: (id: string) => void; onClear?: () => void };

export function BeatTimeline({ durationUs, currentUs, beats, selection, onSeek, onMove, onRemove, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1); const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, rect.width * ratio); canvas.height = 112 * ratio;
    const context = canvas.getContext('2d'); if (!context) return; context.scale(ratio, ratio);
    context.fillStyle = '#18181b'; context.fillRect(0, 0, rect.width, 112);
    if (selection && durationUs) { const start = rect.width * selection.inUs / durationUs; const end = rect.width * selection.outUs / durationUs; context.fillStyle = 'rgba(245, 158, 11, 0.18)'; context.fillRect(start, 0, Math.max(2, end - start), 112); context.fillStyle = '#f59e0b'; context.fillRect(start, 0, 2, 112); context.fillRect(end - 2, 0, 2, 112); }
    context.strokeStyle = '#3f3f46';
    for (let i = 0; i <= 10; i++) { const x = rect.width * i / 10; context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 112); context.stroke(); }
    for (const beat of beats) { const x = durationUs ? rect.width * beat.timeUs / durationUs : 0; context.fillStyle = beat.accent > 1 ? '#fbbf24' : '#f59e0b'; context.fillRect(x - 1, 14, 2, 82); }
    const playX = durationUs ? rect.width * currentUs / durationUs : 0; context.fillStyle = '#fafafa'; context.fillRect(playX - 1, 0, 2, 112);
  }, [beats, currentUs, durationUs, selection]);
  const seek = (clientX: number) => { const rect = canvasRef.current?.getBoundingClientRect(); if (rect) onSeek(Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * durationUs)); };
  return <section aria-label="影片與節奏時間軸" className="border-t border-zinc-800 bg-zinc-950 p-4">
    <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-medium">影片與節奏時間軸</h2><p className="text-[11px] text-zinc-500">琥珀色區域是選取的動作範圍</p></div><div className="flex items-center gap-3"><span className="text-xs text-zinc-500">{beats.length} 個拍點</span>{beats.length > 0 && onClear && <button className="text-xs text-red-300 hover:text-red-200" onClick={onClear}>清除全部</button>}</div></div>
    <canvas ref={canvasRef} className="h-28 w-full rounded-lg" onPointerDown={(event) => seek(event.clientX)} />
    <div className="mt-3 flex min-h-8 gap-2 overflow-x-auto">
      {beats.map((beat) => <div key={beat.id} className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs">
        <input aria-label={`移動 ${ (beat.timeUs / 1_000_000).toFixed(2) } 秒拍點`} className="w-16 bg-transparent" type="number" step="0.01" value={(beat.timeUs / 1_000_000).toFixed(2)} onChange={(event) => onMove(beat.id, Number(event.target.value) * 1_000_000)} />
        <button className="inline-flex items-center gap-1 rounded bg-red-950 px-1.5 py-1 text-red-200" aria-label={`刪除 ${(beat.timeUs / 1_000_000).toFixed(2)} 秒拍點`} onClick={() => onRemove(beat.id)}><X size={13} />刪除</button>
      </div>)}
    </div>
  </section>;
}
