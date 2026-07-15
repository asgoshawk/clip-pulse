import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MediaDropzone } from './MediaDropzone';
const meta = { component: MediaDropzone, args: { busy: false, onFile: fn() } } satisfies Meta<typeof MediaDropzone>;
export default meta; export const Ready: StoryObj<typeof meta> = {}; export const Busy: StoryObj<typeof meta> = { args: { busy: true } };
