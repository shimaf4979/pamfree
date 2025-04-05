'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mapsAPI } from '@/lib/api-client';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Map } from '@/types/map-types';
export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 新規マップのステート
  const [newMap, setNewMap] = useState({
    id: '',
    title: '',
    description: '',
    is_publicly_editable: false,
  });
  
  // 削除確認モーダル用の状態
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<Map | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // 認証状態をチェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // マップ一覧を取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchMaps();
    }
  }, [isAuthenticated]);

  const fetchMaps = async () => {
    setLoading(true);
    try {
      const data = await mapsAPI.getMaps();
      setMaps(data);
      console.log("maps", data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('マップの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setNewMap({ ...newMap, [name]: target.checked });
    } else {
      setNewMap({ ...newMap, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdMap = await mapsAPI.createMap(newMap);
      
      // 成功したら入力フォームをリセットしてマップ一覧を更新
      setNewMap({ 
        id: '', 
        title: '', 
        description: '', 
        is_publicly_editable: false 
      });
      setShowCreateForm(false);
      setMaps([createdMap, ...maps]);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('マップの作成に失敗しました');
      }
    }
  };

  // 削除確認モーダルを表示
  const openDeleteModal = (map: Map) => {
    setMapToDelete(map);
    setDeleteModalOpen(true);
  };

  // 実際の削除処理
  const confirmDelete = async () => {
    if (!mapToDelete) return;
    
    setDeleteInProgress(true);
    
    try {
      // 楽観的UI更新
      setMaps(maps.filter(m => m.id !== mapToDelete.id));
      setDeleteModalOpen(false);
      
      // APIを呼び出してマップを削除
      await mapsAPI.deleteMap(mapToDelete.id);
      
      // 成功メッセージを表示
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = 'マップを削除しました';
      document.body.appendChild(notification);
      
      // 3秒後に通知を削除
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch (error) {
      // エラー発生時、削除したマップを元に戻す
      setMaps(prevMaps => [...prevMaps, mapToDelete]);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('マップの削除に失敗しました');
      }
    } finally {
      setMapToDelete(null);
      setDeleteInProgress(false);
    }
  };

  if (isLoading || loading) {
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
          {user?.role === 'admin' && (
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
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                マップID (英数字のみ)
              </label>
              <input
                type="text"
                id="id"
                name="id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newMap.id}
                onChange={handleInputChange}
                placeholder="例: shop1, hotel2など"
              />
              <p className="text-xs text-gray-500 mt-1">
                URLや識別子として使用されます。英数字、ハイフン、アンダースコアのみ使用可能です。
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="is_publicly_editable" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  id="is_publicly_editable"
                  name="is_publicly_editable"
                  checked={newMap.is_publicly_editable}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                公開編集を許可する（誰でもピンを追加・編集できます）
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                チェックすると、ログインしていないユーザーでもニックネームを設定してピンの追加・編集ができるようになります。
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
                  <p>ID: {map.id}</p>
                  <p>作成日: {new Date(map.created_at).toLocaleDateString()}</p>
                  <p>更新日: {new Date(map.updated_at).toLocaleDateString()}</p>
                  {map.is_publicly_editable && (
                    <p className="text-green-600 font-medium">※ 公開編集モード有効</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-center">
                  <Link
                    href={`/maps/${map.id}/edit`}
                    className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm flex-1 text-center"
                  >
                    編集
                  </Link>
                  {map.is_publicly_editable && (
                    <Link
                      href={`/public-edit?id=${map.id}`}
                      target="_blank"
                      className="px-2 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs sm:text-sm flex-1 text-center"
                    >
                      公開編集
                    </Link>
                  )}
                  <Link
                    href={`/viewer?id=${map.id}`}
                    target="_blank"
                    className="px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm flex-1 text-center"
                  >
                    閲覧
                  </Link>
                  <button
                    onClick={() => openDeleteModal(map)}
                    className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm flex-1 text-center cursor-pointer"
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
      
      {/* 削除確認モーダル */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteInProgress) {
            setDeleteModalOpen(false);
            setMapToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        title="マップの削除"
        message="このマップを削除しますか？この操作は元に戻せません。関連するすべてのエリアとピンも削除されます。"
        itemName={mapToDelete?.title}
      />
    </div>
  );
}