import { Download, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Subscription } from 'rxjs';
import { Button } from '@/components/ui/button';
import type { BeatEvent } from '@/lib/contracts';
import { downloadRhythmTemplate, makeRegularBeats, readRhythmTemplate } from '@/engine/rhythm';
import { analyzeRhythm$ } from '@/engine/rhythm';
import { useAnalysisStore } from '@/stores/analysis-store';

export function RhythmPanel({ durationUs, beats, onReplace }: { durationUs: number; beats: BeatEvent[]; onReplace: (beats: BeatEvent[]) => void }) {
  const input = useRef<HTMLInputElement>(null); const audioInput = useRef<HTMLInputElement>(null); const subscription = useRef<Subscription | null>(null); const [bpm, setBpm] = useState(120); const [error, setError] = useState('');
  const analysisStatus = useAnalysisStore(state => state.status); const analysisMessage = useAnalysisStore(state => state.message); const updateAnalysis = useAnalysisStore(state => state.update);
  useEffect(() => () => subscription.current?.unsubscribe(), []);
  return <section className="space-y-3" aria-labelledby="rhythm-title"><h2 id="rhythm-title" className="text-sm font-semibold">節奏</h2>
    <label className="block text-xs text-zinc-400">固定 BPM
      <input className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" type="number" min="30" max="300" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
    </label>
    <Button className="w-full" variant="secondary" onClick={() => onReplace(makeRegularBeats(durationUs, bpm))}>建立拍點</Button>
    <input ref={audioInput} className="sr-only" type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg" aria-label="參考節奏音訊" onChange={event => { const file=event.target.files?.[0]; if(!file)return; subscription.current?.unsubscribe(); setError(''); updateAnalysis({status:'decoding',progress:0.1,message:'正在解碼參考音訊…'}); subscription.current=analyzeRhythm$(file).subscribe({next:value=>{if(value.type==='progress')updateAnalysis({status:value.phase,progress:value.progress,message:value.phase==='decoding'?'正在解碼參考音訊…':'正在分析拍點…'});else{onReplace(value.beats);updateAnalysis({status:'complete',progress:1,message:`找到 ${value.beats.length} 個拍點`});}},error:reason=>{const message=reason instanceof Error?reason.message:'無法分析參考音訊。';setError(message);updateAnalysis({status:'error',progress:0,message});}}); event.target.value=''; }} />
    <Button className="w-full" variant="secondary" onClick={()=>audioInput.current?.click()} disabled={analysisStatus==='decoding'||analysisStatus==='analyzing'}><Upload size={15}/>{analysisStatus==='decoding'||analysisStatus==='analyzing'?'分析中…':'上傳參考音訊'}</Button>
    {analysisMessage&&<p role="status" className="text-xs text-zinc-400">{analysisMessage}</p>}
    <div className="grid grid-cols-2 gap-2"><input ref={input} className="sr-only" type="file" accept=".json,application/json" aria-label="上傳節奏範本" onChange={async (e) => { const file=e.target.files?.[0]; if (!file) return; try { onReplace((await readRhythmTemplate(file)).beats); setError(''); } catch (reason) { setError(reason instanceof Error ? reason.message : '無法讀取範本。'); } e.target.value=''; }} />
      <Button variant="ghost" onClick={() => input.current?.click()}><Upload size={15}/>匯入</Button><Button variant="ghost" disabled={!beats.length} onClick={() => downloadRhythmTemplate('my-rhythm', durationUs, beats)}><Download size={15}/>匯出</Button></div>
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
  </section>;
}
