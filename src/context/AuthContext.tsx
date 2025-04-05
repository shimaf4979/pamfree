// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { authAPI } from '@/lib/api-client';

// ユーザータイプの定義
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | null>(null);

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初回レンダリング時にユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      const token = getCookie('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error('認証初期化エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ログイン処理
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト処理
  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー登録処理
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authAPI.register(name, email, password);
      router.push('/login?registered=true');
    } catch (error) {
      console.error('登録エラー:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 認証コンテキストを使用するためのカスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}