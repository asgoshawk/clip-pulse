import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
const preview: Preview = { parameters: { layout: 'fullscreen', a11y: { test: 'error' }, backgrounds: { default: 'dark' } } };
export default preview;
