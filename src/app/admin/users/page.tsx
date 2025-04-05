'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api-client';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  // 認証状態と権限をチェック
  useEffect(() => {
    if (!isLoading) {
      // 非認証ユーザーはログインページへリダイレクト
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // 管理者以外は403ページやダッシュボードへリダイレクト
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // ユーザー一覧を取得
      fetchUsers();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ユーザー一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;

    try {
      await adminAPI.updateUserRole(selectedUser.id, newRole);

      // 成功したらユーザー一覧を更新
      fetchUsers();
      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ユーザー役割の更新に失敗しました');
      }
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('このユーザーを削除してもよろしいですか？')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      // 成功したらユーザー一覧を更新
      fetchUsers();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ユーザーの削除に失敗しました');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名前
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                役割
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? '管理者' : 'ユーザー'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openRoleModal(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    disabled={user.id === user.id}
                  >
                    役割変更
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={user.id === user.id}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 役割変更モーダル */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">ユーザー役割の変更</h3>
            <p className="mb-4">
              <span className="font-medium">{selectedUser.name}</span> の役割を変更します。
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                役割
              </label>
              <select
                title="役割"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">一般ユーザー</option>
                <option value="admin">管理者</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={updateUserRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}