import type { MappingMode } from '@/lib/contracts';
const modes: { value: MappingMode; label: string; detail: string }[] = [
  { value:'restart', label:'每拍重播', detail:'每個拍點從選取片段開頭播放' }, { value:'fit', label:'填滿節拍', detail:'調整速度以貼合拍點間距' },
  { value:'hold', label:'停格等待', detail:'播完後停在最後一格' }, { value:'alternate', label:'來回播放', detail:'正向與反向交替播放' },
];
export function MappingPanel({ value, onChange }: { value: MappingMode; onChange: (mode: MappingMode) => void }) {
  return <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold">動作對應</legend>{modes.map(mode => <label key={mode.value} className="flex cursor-pointer gap-3 rounded-lg border border-zinc-800 p-2.5 has-checked:border-amber-400/60 has-checked:bg-amber-400/5"><input type="radio" name="mapping" value={mode.value} checked={value===mode.value} onChange={() => onChange(mode.value)} className="accent-amber-400"/><span><span className="block text-sm">{mode.label}</span><span className="block text-xs text-zinc-500">{mode.detail}</span></span></label>)}</fieldset>;
}
