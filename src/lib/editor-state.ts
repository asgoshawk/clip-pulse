import type { BeatEvent, MappingMode } from './contracts';

export interface EditorDocument {
  durationUs: number;
  frameDurationUs: number;
  selection: { inUs: number; outUs: number } | null;
  beats: BeatEvent[];
  mappingMode: MappingMode;
  referenceAudioEnabled: boolean;
}

export interface EditorState {
  past: EditorDocument[];
  present: EditorDocument;
  future: EditorDocument[];
}

export type EditorAction =
  | { type: 'media/ready'; durationUs: number; frameDurationUs: number }
  | { type: 'selection/set'; inUs: number; outUs: number }
  | { type: 'beat/add'; timeUs: number; accent?: number }
  | { type: 'beat/remove'; id: string }
  | { type: 'beat/move'; id: string; timeUs: number }
  | { type: 'beats/replace'; beats: BeatEvent[] }
  | { type: 'mapping/set'; mode: MappingMode }
  | { type: 'reference-audio/set'; enabled: boolean }
  | { type: 'history/undo' }
  | { type: 'history/redo' };

const empty: EditorDocument = {
  durationUs: 0,
  frameDurationUs: 33_333,
  selection: null,
  beats: [],
  mappingMode: 'restart',
  referenceAudioEnabled: false,
};

export function createInitialState(): EditorState {
  return { past: [], present: structuredClone(empty), future: [] };
}

function commit(state: EditorState, present: EditorDocument): EditorState {
  if (JSON.stringify(state.present) === JSON.stringify(present)) return state;
  return { past: [...state.past.slice(-49), state.present], present, future: [] };
}

function clampSelection(document: EditorDocument, inUs: number, outUs: number) {
  const duration = document.durationUs;
  let end = Math.min(duration, Math.max(0, Math.round(outUs)));
  let start = Math.min(end, Math.max(0, Math.round(inUs)));
  if (end - start < document.frameDurationUs) start = Math.max(0, end - document.frameDurationUs);
  if (end - start < document.frameDurationUs) end = Math.min(duration, start + document.frameDurationUs);
  return { inUs: start, outUs: end };
}

function normalizeBeats(beats: BeatEvent[]): BeatEvent[] {
  const times = new Set<number>();
  return beats
    .filter((beat) => Number.isSafeInteger(beat.timeUs) && beat.timeUs >= 0 && !times.has(beat.timeUs) && times.add(beat.timeUs))
    .sort((a, b) => a.timeUs - b.timeUs);
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  if (action.type === 'history/undo') {
    const previous = state.past.at(-1);
    return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state;
  }
  if (action.type === 'history/redo') {
    const next = state.future[0];
    return next ? { past: [...state.past, state.present], present: next, future: state.future.slice(1) } : state;
  }

  const next = structuredClone(state.present);
  switch (action.type) {
    case 'media/ready':
      next.durationUs = Math.max(0, Math.round(action.durationUs));
      next.frameDurationUs = Math.max(1, Math.round(action.frameDurationUs));
      next.selection = next.durationUs ? { inUs: 0, outUs: Math.min(next.durationUs, 1_000_000) } : null;
      next.beats = [];
      break;
    case 'selection/set':
      next.selection = clampSelection(next, action.inUs, action.outUs);
      break;
    case 'beat/add':
      next.beats = normalizeBeats([...next.beats, { id: crypto.randomUUID(), timeUs: Math.round(action.timeUs), accent: Math.min(3, Math.max(1, action.accent ?? 1)) }]);
      break;
    case 'beat/remove':
      next.beats = next.beats.filter((beat) => beat.id !== action.id);
      break;
    case 'beat/move':
      next.beats = normalizeBeats(next.beats.map((beat) => beat.id === action.id ? { ...beat, timeUs: Math.round(action.timeUs) } : beat));
      break;
    case 'beats/replace':
      next.beats = normalizeBeats(action.beats);
      break;
    case 'mapping/set':
      next.mappingMode = action.mode;
      break;
    case 'reference-audio/set':
      next.referenceAudioEnabled = action.enabled;
      break;
  }
  return commit(state, next);
}
