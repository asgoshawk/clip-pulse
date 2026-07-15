import { FileVideo2, ShieldCheck } from 'lucide-react';
import { useState, type DragEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export function MediaDropzone({ busy, onFile }: { busy: boolean; onFile: (file: File) => void }) {
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
      <input id="media-file" className="sr-only" aria-label="影片檔案" type="file" accept=".mp4,.mov,video/mp4,video/quicktime" disabled={busy} onChange={(event) => { accept(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
      <label htmlFor="media-file" role="button" tabIndex={busy ? -1 : 0} aria-disabled={busy} className={cn('mt-8 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-amber-400 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400', busy && 'pointer-events-none opacity-45')} onKeyDown={(event: KeyboardEvent<HTMLLabelElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.getElementById('media-file')?.click(); } }}>{busy ? '正在檢查影片…' : '選擇影片'}</label>
      <p className="mt-6 inline-flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={14} />檔案只在這台裝置處理，不會上傳。</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </div>
  </section>;
}
