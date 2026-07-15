import { create } from 'zustand';

type AnalysisStatus = 'idle' | 'decoding' | 'analyzing' | 'complete' | 'error';
interface AnalysisState { status: AnalysisStatus; progress: number; message: string; update: (next: Partial<Pick<AnalysisState, 'status' | 'progress' | 'message'>>) => void; reset: () => void }
const initial = { status: 'idle' as const, progress: 0, message: '' };
export const useAnalysisStore = create<AnalysisState>()(set => ({ ...initial, update: next => set(next), reset: () => set(initial) }));
