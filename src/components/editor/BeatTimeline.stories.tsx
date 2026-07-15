import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BeatTimeline } from './BeatTimeline';
const meta = { component: BeatTimeline, args: { durationUs: 5_000_000, currentUs: 1_250_000, beats: [{id:'1',timeUs:0,accent:2},{id:'2',timeUs:500_000,accent:1},{id:'3',timeUs:1_000_000,accent:1}], onSeek: fn(), onMove: fn(), onRemove: fn() } } satisfies Meta<typeof BeatTimeline>;
export default meta; export const Default: StoryObj<typeof meta> = {};
