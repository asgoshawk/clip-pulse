import { FileVideo2, ShieldCheck } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';

export function MediaDropzone({ busy, onFile }: { busy: boolean; onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const accept = (file?: File) => {
    if (!file) return;
    if (!/\.(mp4|mov)$/i.test(file.name)) { setError('請選擇 MP4 或 MOV 影片檔案。'); return; }
    setError(''); onFile(file);
  };
  const drop = (event: DragEvent) => { event.preventDefault(); accept(event.dataTransfer.files[0]); };
  return <section className="mx-auto flex min-h-[32rem] max-w-3xl items-center px-6">
    <div className="w-full rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/70 p-10 text-center shadow-2xl" onDragOver={(event) => event.preventDefault()} onDrop={drop}>
      <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-amber-400/10 text-amber-300"><FileVideo2 size={30} /></div>
      <h1 className="text-3xl font-semibold tracking-tight">讓動作跟著節奏跳動</h1>
      <p className="mx-auto mt-3 max-w-lg text-zinc-400">選一小段動作、打出拍點，立即預覽節奏剪輯。</p>
      <input ref={inputRef} className="sr-only" aria-label="選擇影片檔案" type="file" accept=".mp4,.mov,video/mp4,video/quicktime" disabled={busy} onChange={(event) => accept(event.currentTarget.files?.[0])} />
      <Button className="mt-8" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? '正在檢查影片…' : '選擇影片'}</Button>
      <p className="mt-6 inline-flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={14} />檔案只在這台裝置處理，不會上傳。</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </div>
  </section>;
}
