// src/components/PinInfo.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import PinInfo from './PinInfo';

const meta: Meta<typeof PinInfo> = {
  title: 'Components/PinInfo',
  component: PinInfo,
  argTypes: {
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof PinInfo>;

// デフォルトのピン情報
const defaultPin = {
  id: 'pin1',
  floor_id: 'floor1',
  title: 'サンプルピン',
  description: 'これはサンプルピンの説明文です。\n複数行の説明も可能です。',
  x_position: 50,
  y_position: 50,
  editor_id: 'user1',
  editor_nickname: '山田太郎',
};

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
    pin: defaultPin,
    floors: defaultFloors,
    isEditable: false,
  },
};

export const Editable: Story = {
  args: {
    pin: defaultPin,
    floors: defaultFloors,
    isEditable: true,
  },
};

export const LongDescription: Story = {
  args: {
    pin: {
      ...defaultPin,
      description: `これは非常に長い説明文のテストです。
      改行も含めて、複数行にわたる長文を表示します。
      画面内での折り返しや表示の挙動を確認するための
      サンプルテキストを記載しています。どのように
      レイアウトされるか、また読みやすさを検証します。
      長文でも適切に表示されるかどうかを確認します。`,
    },
    floors: defaultFloors,
    isEditable: true,
  },
};

export const NoNickname: Story = {
  args: {
    pin: {
      ...defaultPin,
      editor_nickname: undefined,
    },
    floors: defaultFloors,
    isEditable: false,
  },
};

export const NoDescription: Story = {
  args: {
    pin: {
      ...defaultPin,
      description: '',
    },
    floors: defaultFloors,
    isEditable: true,
  },
};
