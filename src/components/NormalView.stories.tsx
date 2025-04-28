// src/components/NormalView.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import NormalView from './NormalView';
import { mockFloors, mockPins } from '@/mocks/mockData';

const meta: Meta<typeof NormalView> = {
  title: 'Components/NormalView',
  component: NormalView,
  argTypes: {
    onImageClick: { action: 'image clicked' },
  },
  decorators: [
    (Story, { args }) => {
      const containerRef = useRef<HTMLDivElement>(null);
      return (
        <div
          ref={containerRef}
          style={{
            width: '600px',
            height: '400px',
            border: '1px solid gray',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof NormalView>;

export const Default: Story = {
  args: {
    floor: mockFloors[0],
    pins: mockPins,
  },
};

export const NoImage: Story = {
  args: {
    floor: mockFloors[1], // image_url が null のフロア
    pins: [],
  },
};

export const NoFloor: Story = {
  args: {
    floor: null,
    pins: [],
  },
};

export const WithPins: Story = {
  args: {
    floor: mockFloors[0],
    pins: mockPins.filter((pin) => pin.floor_id === mockFloors[0].id),
  },
};
