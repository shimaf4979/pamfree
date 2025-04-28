// src/components/QRCodeGenerator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import QRCodeGenerator from './QRCodeGenerator';

const meta: Meta<typeof QRCodeGenerator> = {
  title: 'Components/QRCodeGenerator',
  component: QRCodeGenerator,
};

export default meta;
type Story = StoryObj<typeof QRCodeGenerator>;

export const Default: Story = {
  args: {
    url: '/viewer?id=sample-map',
    title: 'サンプルマップ',
  },
};

export const WithPublicEdit: Story = {
  args: {
    url: '/viewer?id=sample-map',
    title: 'サンプルマップ',
    publicEditUrl: '/public-edit?id=sample-map',
  },
};

export const LongUrl: Story = {
  args: {
    url: '/viewer?id=very-long-map-identifier-with-many-characters',
    title: '長いIDを持つマップ',
    publicEditUrl: '/public-edit?id=very-long-map-identifier-with-many-characters',
  },
};

export const NoPublicEdit: Story = {
  args: {
    url: '/viewer?id=private-map',
    title: '非公開マップ',
  },
};
