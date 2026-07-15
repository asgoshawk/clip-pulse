import { useEffect, useState } from 'react';
import { formatTime, parseTime } from '@/lib/time';

export function TimeField({ label, valueUs, maxUs, onCommit }: { label: string; valueUs: number; maxUs: number; onCommit: (valueUs: number) => void }) {
  const [draft, setDraft] = useState(formatTime(valueUs)); const [error, setError] = useState('');
  useEffect(() => setDraft(formatTime(valueUs)), [valueUs]);
  const commit = () => { const parsed = parseTime(draft); if (parsed === null) { setError('請輸入秒數，例如 12.5 或 1:02.5'); return; } const value = Math.min(maxUs, parsed); onCommit(value); setDraft(formatTime(value)); setError(parsed > maxUs ? '已調整為影片長度上限。' : ''); };
  return <label className="block text-xs text-zinc-400">{label}<input aria-label={label} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-zinc-100 focus:border-amber-400 focus:outline-none" type="text" inputMode="decimal" value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }} />{error && <span className="mt-1 block text-[11px] text-amber-300">{error}</span>}</label>;
}
