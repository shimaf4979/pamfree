// src/components/ImprovedModal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ImprovedModal from './ImprovedModal';

const meta: Meta<typeof ImprovedModal> = {
  title: 'Components/ImprovedModal',
  component: ImprovedModal,
  argTypes: {
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof ImprovedModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'サンプルモーダル',
    children: (
      <div>
        <p>モーダルの内容をここに記述します。</p>
        <p>複数の段落も可能です。</p>
      </div>
    ),
  },
};

export const LongContent: Story = {
  args: {
    isOpen: true,
    title: '長いコンテンツのモーダル',
    children: (
      <div>
        <p>これは非常に長いコンテンツを持つモーダルの例です。</p>
        {[...Array(10)].map((_, i) => (
          <p key={i}>
            長い説明文 {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        ))}
      </div>
    ),
  },
};

export const NoTitle: Story = {
  args: {
    isOpen: true,
    children: (
      <div>
        <p>タイトルのないモーダル</p>
        <button>サンプルボタン</button>
      </div>
    ),
  },
};

export const DifferentSizes: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h2>モーダルサイズの比較</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3>Small</h3>
          <ImprovedModal {...args} size="sm">
            <p>小さいサイズのモーダル</p>
          </ImprovedModal>
        </div>
        <div>
          <h3>Medium</h3>
          <ImprovedModal {...args} size="md">
            <p>標準的なサイズのモーダル</p>
          </ImprovedModal>
        </div>
        <div>
          <h3>Large</h3>
          <ImprovedModal {...args} size="lg">
            <p>大きいサイズのモーダル</p>
          </ImprovedModal>
        </div>
        <div>
          <h3>Extra Large</h3>
          <ImprovedModal {...args} size="xl">
            <p>特大サイズのモーダル</p>
          </ImprovedModal>
        </div>
      </div>
    </div>
  ),
  args: {
    isOpen: true,
    title: 'サイズ比較',
  },
};
