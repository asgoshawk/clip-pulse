import { describe, expect, it } from 'vitest';
import { createInitialState, editorReducer } from './editor-state';

describe('editorReducer', () => {
  it('keeps beats ordered and supports undo', () => {
    let state = createInitialState();
    state = editorReducer(state, { type: 'beat/add', timeUs: 500_000 });
    state = editorReducer(state, { type: 'beat/add', timeUs: 100_000 });
    expect(state.present.beats.map((beat) => beat.timeUs)).toEqual([100_000, 500_000]);
    state = editorReducer(state, { type: 'history/undo' });
    expect(state.present.beats.map((beat) => beat.timeUs)).toEqual([500_000]);
  });

  it('clamps selection to media duration and keeps one frame', () => {
    let state = createInitialState();
    state = editorReducer(state, { type: 'media/ready', durationUs: 2_000_000, frameDurationUs: 33_333 });
    state = editorReducer(state, { type: 'selection/set', inUs: 1_999_999, outUs: 3_000_000 });
    expect(state.present.selection).toEqual({ inUs: 1_966_667, outUs: 2_000_000 });
  });

  it('does not create duplicate beat timestamps', () => {
    let state = createInitialState();
    state = editorReducer(state, { type: 'beat/add', timeUs: 100_000 });
    state = editorReducer(state, { type: 'beat/add', timeUs: 100_000 });
    expect(state.present.beats).toHaveLength(1);
  });
});
