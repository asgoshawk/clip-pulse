import { CircleCheck, MousePointer2, Play, TimerReset, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ComposeOnboarding({ beatCount, onDismiss }: { beatCount: number; onDismiss: () => void }) {
  return <section aria-labelledby="compose-guide-title" className="rounded-xl border border-amber-400/35 bg-amber-400/5 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">快速開始</p>
        <h2 id="compose-guide-title" className="mt-1 text-sm font-semibold">三步完成節奏編排</h2>
      </div>
      <Button type="button" variant="ghost" size="icon" aria-label="關閉操作引導" onClick={onDismiss}><X size={15} /></Button>
    </div>
    <ol className="mt-3 space-y-3 text-xs text-zinc-300">
      <li className="flex gap-2"><TimerReset className="mt-0.5 shrink-0 text-amber-300" size={15} /><span><strong className="block text-zinc-100">設定成品總長度</strong>先決定整段成品要播放多久。</span></li>
      <li className="flex gap-2"><MousePointer2 className="mt-0.5 shrink-0 text-amber-300" size={15} /><span><strong className="block text-zinc-100">放入片段實例</strong>點成品時間軸選位置，再按「在此加入片段」或 Space。</span></li>
      <li className="flex gap-2"><Play className="mt-0.5 shrink-0 text-amber-300" size={15} /><span><strong className="block text-zinc-100">播放確認</strong>按預覽區下方的播放鍵，畫面、播放頭與來源聲音會一起播放。</span></li>
    </ol>
    <p className="mt-3 flex items-center gap-2 rounded-md bg-zinc-950/70 px-3 py-2 text-xs text-zinc-400"><CircleCheck className="text-emerald-400" size={14} />已在 0 秒放入第一個片段，目前共有 {beatCount} 個。</p>
  </section>;
}
