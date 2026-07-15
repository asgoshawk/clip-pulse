import { Pause, Play, Redo2, RotateCcw, Sparkles, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BeatTimeline } from '@/components/editor/BeatTimeline';
import { AudioMixer } from '@/components/editor/AudioMixer';
import { ExportDialog } from '@/components/editor/ExportDialog';
import { MappingPanel } from '@/components/editor/MappingPanel';
import { MediaDropzone } from '@/components/editor/MediaDropzone';
import { RhythmPanel } from '@/components/editor/RhythmPanel';
import { Button } from '@/components/ui/button';
import { detectCapabilities, type CapabilityReport } from '@/engine/capabilities';
import { inspectMedia, releaseMedia, type MediaInfo } from '@/engine/media';
import { compilePlan } from '@/engine/plan';
import { mapOutputToSourceUs } from '@/engine/playback';
import type { RenderPlanV1 } from '@/lib/contracts';
import { createInitialState, editorReducer } from '@/lib/editor-state';

const seconds = (us: number) => (us / 1e6).toFixed(2);

export default function App() {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialState);
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [currentUs, setCurrentUs] = useState(0); const [playing, setPlaying] = useState(false);
  const [caps, setCaps] = useState<CapabilityReport | null>(null); const [renderPlan, setRenderPlan] = useState<RenderPlanV1 | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { detectCapabilities().then(setCaps); }, []);
  useEffect(() => () => releaseMedia(media), [media]);
  const load = async (file: File) => { setBusy(true); setError(''); try { const next = await inspectMedia(file); setMedia(next); dispatch({ type: 'media/ready', durationUs: next.durationUs, frameDurationUs: next.frameDurationUs }); } catch (reason) { setError(reason instanceof Error ? reason.message : '無法讀取影片。'); } finally { setBusy(false); } };
  const tap = useCallback(() => dispatch({ type: 'beat/add', timeUs: currentUs }), [currentUs]);

  useEffect(() => {
    const selection = state.present.selection;
    if (!selection || !state.present.beats.length) { setRenderPlan(null); return; }
    let active = true;
    compilePlan(selection.inUs, selection.outUs, state.present.beats.map(beat => beat.timeUs), state.present.mappingMode).then(plan => { if (active) setRenderPlan(plan); });
    return () => { active = false; };
  }, [state.present.selection, state.present.beats, state.present.mappingMode]);

  useEffect(() => {
    if (!playing || !renderPlan?.segments.length) return;
    videoRef.current?.pause(); const started = performance.now(); let frame = 0;
    const tick = (now: number) => { const sourceUs = mapOutputToSourceUs(renderPlan, (now - started) * 1000); if (videoRef.current) videoRef.current.currentTime = Math.max(0, sourceUs / 1e6); setCurrentUs(sourceUs); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [playing, renderPlan]);

  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); dispatch({ type: event.shiftKey ? 'history/redo' : 'history/undo' }); return; } if (event.target instanceof HTMLInputElement) return; if (event.code === 'Space') { event.preventDefault(); tap(); } if (event.key.toLowerCase() === 'i') dispatch({ type: 'selection/set', inUs: currentUs, outUs: state.present.selection?.outUs ?? state.present.durationUs }); if (event.key.toLowerCase() === 'o') dispatch({ type: 'selection/set', inUs: state.present.selection?.inUs ?? 0, outUs: currentUs }); }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [currentUs, state.present, tap]);

  if (!media) return <main className="min-h-screen"><header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><span className="flex items-center gap-2 font-semibold"><Sparkles className="text-amber-300" size={18} />Clip Pulse</span><span className="text-xs text-zinc-500">Chrome 優先 · 本機處理</span></header><MediaDropzone busy={busy} onFile={load} />{error && <p role="alert" className="mx-auto max-w-3xl px-6 text-center text-red-300">{error}</p>}</main>;

  const selection = state.present.selection!;
  const seek = (timeUs: number) => { setPlaying(false); setCurrentUs(timeUs); if (videoRef.current) videoRef.current.currentTime = timeUs / 1e6; };
  const toggle = () => { if (playing) { setPlaying(false); videoRef.current?.pause(); } else if (renderPlan) setPlaying(true); else videoRef.current?.play(); };
  return <main className="min-h-screen bg-zinc-950">
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-4"><span className="flex items-center gap-2 font-semibold"><Sparkles className="text-amber-300" size={17} />Clip Pulse</span><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="復原" disabled={!state.past.length} onClick={() => dispatch({ type: 'history/undo' })}><Undo2 size={16} /></Button><Button variant="ghost" size="icon" aria-label="重做" disabled={!state.future.length} onClick={() => dispatch({ type: 'history/redo' })}><Redo2 size={16} /></Button><Button variant="ghost" onClick={() => setMedia(null)}><RotateCcw size={15} />換影片</Button></div></header>
    <div className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-[1fr_19rem]"><section className="flex min-w-0 flex-col"><div className="relative grid flex-1 place-items-center bg-black p-4"><video ref={videoRef} src={media.url} muted={!state.present.referenceAudioEnabled} className="max-h-[58vh] max-w-full rounded-lg shadow-2xl" playsInline onTimeUpdate={event => { if (!renderPlan) setCurrentUs(Math.round(event.currentTarget.currentTime * 1e6)); }} onPlay={() => setPlaying(true)} onPause={() => { if (!renderPlan) setPlaying(false); }} />{playing && renderPlan && <span className="absolute left-6 top-6 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-zinc-950">節奏預覽中</span>}</div>
      <div className="flex items-center gap-3 border-t border-zinc-800 px-4 py-3"><Button size="icon" aria-label={playing ? '暫停' : '播放'} onClick={toggle}>{playing ? <Pause size={17} /> : <Play size={17} />}</Button><span className="w-28 font-mono text-xs">{seconds(currentUs)} / {seconds(media.durationUs)} 秒</span><input aria-label="播放位置" className="min-w-0 flex-1 accent-amber-400" type="range" min="0" max={media.durationUs} value={currentUs} onChange={event => seek(Number(event.target.value))} /><Button variant="secondary" onClick={tap}>Tap 拍點 <kbd>Space</kbd></Button></div>
      <BeatTimeline durationUs={media.durationUs} currentUs={currentUs} beats={state.present.beats} onSeek={seek} onMove={(id, timeUs) => dispatch({ type: 'beat/move', id, timeUs })} onRemove={id => dispatch({ type: 'beat/remove', id })} /></section>
      <aside className="space-y-6 overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-4"><section><h2 className="text-sm font-semibold">動作片段</h2><div className="mt-2 grid grid-cols-2 gap-2"><label className="text-xs text-zinc-400">起點（秒）<input className="mt-1 w-full rounded-md bg-zinc-900 p-2" type="number" step="0.01" value={seconds(selection.inUs)} onChange={event => dispatch({ type: 'selection/set', inUs: Number(event.target.value) * 1e6, outUs: selection.outUs })} /></label><label className="text-xs text-zinc-400">終點（秒）<input className="mt-1 w-full rounded-md bg-zinc-900 p-2" type="number" step="0.01" value={seconds(selection.outUs)} onChange={event => dispatch({ type: 'selection/set', inUs: selection.inUs, outUs: Number(event.target.value) * 1e6 })} /></label></div></section>
        <RhythmPanel durationUs={media.durationUs} beats={state.present.beats} onReplace={beats => dispatch({ type: 'beats/replace', beats })} /><MappingPanel value={state.present.mappingMode} onChange={mode => dispatch({ type: 'mapping/set', mode })} /><AudioMixer enabled={state.present.referenceAudioEnabled} onChange={enabled => dispatch({ type: 'reference-audio/set', enabled })} />
        <section className="rounded-lg border border-zinc-800 p-3 text-xs text-zinc-400"><p>{media.width} × {media.height} · {media.name}</p><p className="mt-1">WebGPU：{caps?.webGpu ? '可用' : '未啟用'} · WebCodecs：{caps?.videoEncode ? '可用' : '不可用'}</p><p className="mt-1">WASM 節奏規劃：{renderPlan?.segments.length ?? 0} 個片段</p></section><ExportDialog videoRef={videoRef} selection={selection} size={media} renderPlan={renderPlan} />
      </aside></div>
  </main>;
}
