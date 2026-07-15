import { describe, expect, it } from 'vitest';
import { createWorkflow, workflowReducer } from './workflow-machine';

describe('workflow state machine', () => {
  it('only advances through valid production steps', () => {
    let state = createWorkflow(); expect(state.step).toBe('import');
    state = workflowReducer(state, { type: 'MEDIA_READY' }); expect(state.step).toBe('select');
    state = workflowReducer(state, { type: 'NEXT' }); expect(state.step).toBe('compose');
    expect(workflowReducer(state, { type: 'NEXT' })).toEqual(state);
  });
  it('keeps playback modes mutually exclusive and resets on navigation', () => {
    let state = workflowReducer(workflowReducer(createWorkflow(), { type: 'MEDIA_READY' }), { type: 'PLAY_RANGE' });
    expect(state.playback).toBe('range'); state = workflowReducer(state, { type: 'NEXT' }); expect(state.playback).toBe('stopped');
    state = workflowReducer(state, { type: 'PLAY_COMPOSITION' }); expect(state.playback).toBe('composition');
    state = workflowReducer(state, { type: 'STOP' }); expect(state.playback).toBe('stopped');
  });
});
