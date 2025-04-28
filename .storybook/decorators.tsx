// .storybook/decorators.tsx
import React from 'react';
import type { Decorator } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import '../src/app/globals.css';

// グローバルQueryClientの作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// デフォルトのセッション情報
const defaultSession = {
  user: {
    id: 'test-user',
    name: 'テストユーザー',
    email: 'test@example.com',
    role: 'user',
  },
  expires: '2030-01-01T00:00:00.000Z',
};

// グローバルデコレーター
export const decorators: Decorator[] = [
  // QueryClientProviderでラップ
  (Story) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  ),

  // セッション情報を提供
  (Story) => (
    <SessionProvider session={defaultSession}>
      <Story />
    </SessionProvider>
  ),

  // グローバルスタイリング
  (Story) => (
    <div className="p-4">
      <Story />
    </div>
  ),
];
