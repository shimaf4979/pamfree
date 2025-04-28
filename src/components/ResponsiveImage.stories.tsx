// src/components/ResponsiveImage.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ResponsiveImage from './ResponsiveImage';

const meta: Meta<typeof ResponsiveImage> = {
  title: 'Components/ResponsiveImage',
  component: ResponsiveImage,
  argTypes: {
    onLoad: { action: 'loaded' },
    onProgressChange: { action: 'progress changed' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ResponsiveImage>;

export const Default: Story = {
  args: {
    src: '/placeholder-image.jpg',
    alt: 'プレースホルダー画像',
  },
};

export const Loading: Story = {
  args: {
    src: 'https://via.placeholder.com/1200x800.png?text=Loading+Image',
    alt: '読み込み中の画像',
  },
  parameters: {
    // ネットワーク遅延をシミュレート
    msw: {
      handlers: [
        // イメージのローディングを遅延させるハンドラー
      ],
    },
  },
};

export const ErrorState: Story = {
  args: {
    src: '/non-existent-image.jpg',
    alt: '存在しない画像',
  },
  parameters: {
    msw: {
      handlers: [
        // 404エラーをシミュレート
      ],
    },
  },
};
