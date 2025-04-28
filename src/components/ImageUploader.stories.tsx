// src/components/ImageUploader.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ImageUploader from './ImageUploader';
import { mockFloors } from '@/mocks/mockData';

const meta: Meta<typeof ImageUploader> = {
  title: 'Components/ImageUploader',
  component: ImageUploader,
  argTypes: {
    onUploadComplete: { action: 'upload completed' },
    onUploadError: { action: 'upload error' },
  },
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

export const Default: Story = {
  args: {
    floorId: mockFloors[0].id,
    buttonText: '画像をアップロード',
  },
};

export const WithCurrentImage: Story = {
  args: {
    floorId: mockFloors[0].id,
    currentImageUrl: '/placeholder-image.jpg',
    buttonText: '画像を変更',
  },
};

export const CustomButtonText: Story = {
  args: {
    floorId: mockFloors[0].id,
    buttonText: 'フロアの画像を選択',
  },
};

export const Uploading: Story = {
  render: (args) => {
    // アップロード中の状態をシミュレート
    return (
      <div>
        <ImageUploader
          {...args}
          // @ts-ignore
          uploadProgress={50}
        />
      </div>
    );
  },
  args: {
    floorId: mockFloors[0].id,
  },
};

export const UploadError: Story = {
  args: {
    floorId: mockFloors[0].id,
    // エラー時のハンドリングをデモ
    onUploadError: (message: string) => {
      console.error('Upload Error:', message);
      alert(message);
    },
  },
};
