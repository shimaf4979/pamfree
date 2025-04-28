// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import { decorators } from './decorators';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F4F4F4' },
        { name: 'dark', value: '#333333' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
  decorators,
};

export default preview;
