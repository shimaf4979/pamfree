// src/components/DeleteConfirmationModal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const meta: Meta<typeof DeleteConfirmationModal> = {
  title: 'Components/DeleteConfirmationModal',
  component: DeleteConfirmationModal,
  argTypes: {
    onClose: { action: 'closed' },
    onConfirm: { action: 'confirmed' },
  },
};

export default meta;
type Story = StoryObj<typeof DeleteConfirmationModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'アイテムの削除',
    message: 'このアイテムを削除してもよろしいですか？',
    itemName: 'サンプルアイテム',
  },
};

export const LongItemName: Story = {
  args: {
    isOpen: true,
    title: '長い名前のアイテム削除',
    message: '非常に長い名前を持つアイテムの削除確認メッセージです。',
    itemName: '非常に長いアイテム名で、複数の単語を含む長い名前のアイテムの削除確認',
  },
};

export const NoItemName: Story = {
  args: {
    isOpen: true,
    title: 'アイテム削除',
    message: '名前のないアイテムを削除してもよろしいですか？',
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    title: 'アイテムの削除',
    message: 'このモーダルは表示されません',
    itemName: 'クローズドアイテム',
  },
};
