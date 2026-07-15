import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BeatEvent } from '@/lib/contracts';
import { downloadRhythmTemplate, makeRegularBeats, readRhythmTemplate } from '@/engine/rhythm';

export function RhythmPanel({ durationUs, beats, onReplace }: { durationUs: number; beats: BeatEvent[]; onReplace: (beats: BeatEvent[]) => void }) {
  const input = useRef<HTMLInputElement>(null); const [bpm, setBpm] = useState(120); const [error, setError] = useState('');
  return <section className="space-y-3" aria-labelledby="rhythm-title"><h2 id="rhythm-title" className="text-sm font-semibold">節奏</h2>
    <label className="block text-xs text-zinc-400">固定 BPM
      <input className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" type="number" min="30" max="300" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
    </label>
    <Button className="w-full" variant="secondary" onClick={() => onReplace(makeRegularBeats(durationUs, bpm))}>建立拍點</Button>
    <div className="grid grid-cols-2 gap-2"><input ref={input} className="sr-only" type="file" accept=".json,application/json" aria-label="上傳節奏範本" onChange={async (e) => { const file=e.target.files?.[0]; if (!file) return; try { onReplace((await readRhythmTemplate(file)).beats); setError(''); } catch (reason) { setError(reason instanceof Error ? reason.message : '無法讀取範本。'); } e.target.value=''; }} />
      <Button variant="ghost" onClick={() => input.current?.click()}><Upload size={15}/>匯入</Button><Button variant="ghost" disabled={!beats.length} onClick={() => downloadRhythmTemplate('my-rhythm', durationUs, beats)}><Download size={15}/>匯出</Button></div>
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
  </section>;
}
