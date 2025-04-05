'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { accountAPI } from '@/lib/api-client';

export default function AccountPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 認証状態をチェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (user) {
      setName(user.name || '');
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setUpdateLoading(true);

    try {
      const data = await accountAPI.updateProfile(name);
      setMessage('プロフィールを更新しました');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('プロフィールの更新中にエラーが発生しました');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    setPasswordLoading(true);

    try {
      await accountAPI.changePassword(currentPassword, newPassword);
      setMessage('パスワードを変更しました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('パスワードの変更中にエラーが発生しました');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* プロフィール情報 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={user?.email || ''}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">メールアドレスは変更できません</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                名前
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="名前を入力"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {updateLoading ? '更新中...' : '更新する'}
              </button>
            </div>
          </form>
        </div>
        
        {/* パスワード変更 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">パスワード変更</h2>
          
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                現在のパスワード
              </label>
              <input
                type="password"
                id="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                id="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="新しいパスワード"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                id="confirm-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="新しいパスワード（確認）"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {passwordLoading ? '変更中...' : 'パスワードを変更'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}