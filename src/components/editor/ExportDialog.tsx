import { Download, LoaderCircle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportMp4 } from '@/engine/exporter';

export function ExportDialog({ video, selection, size }: { video: HTMLVideoElement | null; selection: {inUs:number;outUs:number}|null; size:{width:number;height:number} }) {
  const [progress,setProgress]=useState<number|null>(null); const [error,setError]=useState(''); const abort=useRef<AbortController>(null);
  const run=async()=>{ if(!video||!selection)return; abort.current=new AbortController(); setProgress(0); setError(''); try { const blob=await exportMp4({video,inUs:selection.inUs,outUs:selection.outUs,...size,signal:abort.current.signal,onProgress:setProgress}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download='clip-pulse.mp4';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); } catch(reason){setError(reason instanceof Error?reason.message:'匯出失敗。');} finally{setProgress(null);abort.current=null;} };
  return <div className="space-y-2"><Button className="w-full" disabled={!video||!selection||progress!==null} onClick={run}>{progress===null?<Download size={16}/>:<LoaderCircle className="animate-spin" size={16}/>} {progress===null?'匯出 MP4':`匯出中 ${Math.round(progress*100)}%`}</Button>{progress!==null&&<Button className="w-full" variant="ghost" onClick={()=>abort.current?.abort()}><X size={15}/>取消</Button>}<p className="text-xs text-zinc-500">H.264 MP4 · 最多 1080p · 本機處理</p>{error&&<p role="alert" className="text-xs text-red-300">{error}</p>}</div>;
}
