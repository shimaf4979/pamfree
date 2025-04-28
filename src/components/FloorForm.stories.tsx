// src/components/FloorForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import FloorForm from './FloorForm';
import React from 'react';
const meta: Meta<typeof FloorForm> = {
  title: 'Components/FloorForm',
  component: FloorForm,
  argTypes: {
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
};

export default meta;
type Story = StoryObj<typeof FloorForm>;

// モックの送信ハンドラー
const mockOnSubmit = async (floorNumber: number, name: string) => {
  console.log(`Floor submitted: Number ${floorNumber}, Name ${name}`);
  // 擬似的な非同期処理
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// モックのキャンセルハンドラー
const mockOnCancel = () => {
  console.log('Form cancelled');
};

export const Default: Story = {
  args: {
    initialFloorNumber: 1,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  },
};

export const NextFloor: Story = {
  args: {
    initialFloorNumber: 2,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  },
};

export const LargeFloorNumber: Story = {
  args: {
    initialFloorNumber: 10,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  },
};

export const CustomName: Story = {
  render: (args) => {
    const [name, setName] = React.useState('');

    const handleSubmit = async (floorNumber: number, submittedName: string) => {
      await args.onSubmit(floorNumber, submittedName);
    };

    return <FloorForm {...args} onSubmit={handleSubmit} />;
  },
  args: {
    initialFloorNumber: 3,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  },
};

export const Submitting: Story = {
  render: (args) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (floorNumber: number, name: string) => {
      setIsSubmitting(true);
      try {
        await args.onSubmit(floorNumber, name);
      } finally {
        setIsSubmitting(false);
      }
    };

    return <FloorForm {...args} onSubmit={handleSubmit} />;
  },
  args: {
    initialFloorNumber: 4,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  },
};
