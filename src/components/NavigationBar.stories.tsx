// src/components/NavigationBar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SessionProvider } from 'next-auth/react';
import NavigationBar from './NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

// デフォルトのセッション情報
const defaultUserSession = {
  user: {
    id: 'user-1',
    name: 'ユーザー名',
    email: 'user@example.com',
    role: 'user',
  },
  expires: '2030-01-01T00:00:00.000Z',
};

// 管理者のセッション情報
const adminUserSession = {
  user: {
    id: 'admin-1',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
  },
  expires: '2030-01-01T00:00:00.000Z',
};

export const LoggedOut: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const LoggedInUser: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={defaultUserSession}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const LoggedInAdmin: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={adminUserSession}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const MobileView: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={defaultUserSession}>
        <div style={{ maxWidth: '375px', margin: '0 auto' }}>
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};
