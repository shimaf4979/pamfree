// src/components/PinList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import PinList from './PinList';

const meta: Meta<typeof PinList> = {
  title: 'Components/PinList',
  component: PinList,
  argTypes: {
    onPinClick: { action: 'pin clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof PinList>;

// デフォルトのピン情報
const defaultPins = [
  {
    id: 'pin1',
    floor_id: 'floor1',
    title: 'サンプルピン1',
    description: 'これは1つ目のテストピンです。',
    x_position: 30,
    y_position: 40,
    editor_nickname: '山田太郎',
  },
  {
    id: 'pin2',
    floor_id: 'floor1',
    title: 'サンプルピン2',
    description:
      'これは2つ目のテストピンです。長い説明文を含んでいます。これは複数行にわたる説明の例です。',
    x_position: 60,
    y_position: 70,
    editor_nickname: '佐藤花子',
  },
];

// デフォルトのフロア情報
const defaultFloors = [
  {
    id: 'floor1',
    map_id: 'map1',
    floor_number: 1,
    name: '1階',
    image_url: null,
  },
  {
    id: 'floor2',
    map_id: 'map1',
    floor_number: 2,
    name: '2階',
    image_url: null,
  },
];

export const Default: Story = {
  args: {
    pins: defaultPins,
    floors: defaultFloors,
    activeFloor: 'floor1',
  },
};

export const SelectedPin: Story = {
  args: {
    pins: defaultPins,
    floors: defaultFloors,
    activeFloor: 'floor1',
    selectedPinId: 'pin1',
  },
};

export const EmptyFloor: Story = {
  args: {
    pins: [],
    floors: defaultFloors,
    activeFloor: 'floor2',
  },
};

export const NoNickname: Story = {
  args: {
    pins: [
      {
        ...defaultPins[0],
        editor_nickname: undefined,
      },
      {
        ...defaultPins[1],
        editor_nickname: undefined,
      },
    ],
    floors: defaultFloors,
    activeFloor: 'floor1',
  },
};
