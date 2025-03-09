// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Map = {
  id: string;
  map_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMap, setNewMap] = useState({
    map_id: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    // 非認証ユーザーはログインページへリダイレクト
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // マップ一覧を取得
    fetchMaps();
  }, [session, status, router]);

  const fetchMaps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maps');
      if (!response.ok) {
        throw new Error('マップの取得に失敗しました');
      }
      const data = await response.json();
      setMaps(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMap({ ...newMap, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMap),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'マップの作成に失敗しました');
      }

      // 成功したら入力フォームをリセットしてマップ一覧を更新
      setNewMap({ map_id: '', title: '', description: '' });
      setShowCreateForm(false);
      fetchMaps();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('エラーが発生しました');
      }
    }
  };

  const deleteMap = async (mapId: string) => {
    if (!window.confirm('このマップを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/${mapId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'マップの削除に失敗しました');
      }

      // 成功したらマップ一覧を更新
      fetchMaps();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('エラーが発生しました');
      }
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">マイマップ</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">マイマップ</h1>
        <div className="flex space-x-2">
          {/* 管理者の場合、ユーザー管理ページへのリンクを表示 */}
          {session?.user?.role === 'admin' && (
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              ユーザー管理
            </Link>
          )}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showCreateForm ? 'キャンセル' : '新規マップ作成'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 新規マップ作成フォーム */}
      {showCreateForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">新規マップ作成</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="map_id" className="block text-sm font-medium text-gray-700 mb-1">
                マップID (英数字のみ)
              </label>
              <input
                type="text"
                id="map_id"
                name="map_id"
                required
                pattern="[a-zA-Z0-9_-]+"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newMap.map_id}
                onChange={handleInputChange}
                placeholder="例: shop1, hotel2など"
              />
              <p className="text-xs text-gray-500 mt-1">
                URLや識別子として使用されます。英数字、ハイフン、アンダースコアのみ使用可能です。
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newMap.title}
                onChange={handleInputChange}
                placeholder="マップのタイトル"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                説明 (任意)
              </label>
              <textarea
                id="description"
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                value={newMap.description}
                onChange={handleInputChange}
                placeholder="マップの説明"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      )}

      {/* マップ一覧 */}
      {maps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <div key={map.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{map.title}</h2>
                <p className="text-gray-600 mb-4 text-sm">{map.description || '説明なし'}</p>
                <div className="text-gray-500 text-xs mb-4">
                  <p>ID: {map.map_id}</p>
                  <p>作成日: {new Date(map.created_at).toLocaleDateString()}</p>
                  <p>更新日: {new Date(map.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/maps/${map.map_id}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex-1 text-center"
                  >
                    編集
                  </Link>
                  <Link
                    href={`/viewer?id=${map.map_id}`}
                    target="_blank"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex-1 text-center"
                  >
                    閲覧
                  </Link>
                  <button
                    onClick={() => deleteMap(map.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm cursor-pointer"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600">
            マップがまだありません。「新規マップ作成」ボタンから作成しましょう。
          </p>
        </div>
      )}
    </div>
  );
}