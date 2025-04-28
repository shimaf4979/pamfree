// src/components/LoadingIndicator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import LoadingIndicator from './LoadingIndicator';

const meta: Meta<typeof LoadingIndicator> = {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
};

export default meta;
type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {
  args: {
    message: '読み込み中...',
  },
};

export const WithProgress: Story = {
  args: {
    progress: 50,
    message: 'データをダウンロード中...',
  },
};

export const FullProgress: Story = {
  args: {
    progress: 100,
    message: '完了しました',
  },
};

export const FullScreen: Story = {
  args: {
    isFullScreen: true,
    message: '処理を実行しています...',
  },
};

export const NoSpinner: Story = {
  args: {
    showSpinner: false,
    message: 'スピナーなしのローディング',
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'カスタムメッセージ: データを処理しています',
    progress: 75,
  },
};
