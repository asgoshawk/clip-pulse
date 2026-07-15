export type WorkflowStep = 'import' | 'select' | 'rhythm' | 'preview';
export type PlaybackMode = 'stopped' | 'source' | 'range' | 'rhythm';
export interface WorkflowState { step: WorkflowStep; playback: PlaybackMode }
export type WorkflowEvent = { type: 'MEDIA_READY' | 'RESET' | 'NEXT' | 'BACK' | 'PLAY_SOURCE' | 'PLAY_RANGE' | 'PLAY_RHYTHM' | 'STOP' };

export const createWorkflow = (): WorkflowState => ({ step: 'import', playback: 'stopped' });
const order: WorkflowStep[] = ['select', 'rhythm', 'preview'];
export function workflowReducer(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  if (event.type === 'RESET') return createWorkflow(); if (event.type === 'MEDIA_READY') return { step: 'select', playback: 'stopped' };
  if (event.type === 'STOP') return { ...state, playback: 'stopped' }; if (event.type === 'PLAY_SOURCE') return { ...state, playback: 'source' }; if (event.type === 'PLAY_RANGE') return { ...state, playback: 'range' }; if (event.type === 'PLAY_RHYTHM') return { ...state, playback: 'rhythm' };
  if (state.step === 'import') return state; const index = order.indexOf(state.step); const next = event.type === 'NEXT' ? Math.min(order.length - 1, index + 1) : event.type === 'BACK' ? Math.max(0, index - 1) : index;
  return next === index ? state : { step: order[next], playback: 'stopped' };
}
