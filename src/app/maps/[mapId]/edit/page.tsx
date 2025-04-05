// app/maps/[mapId]/edit/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mapsAPI, floorsAPI, pinsAPI } from '@/lib/api-client';
import { uploadImage } from '@/utils/cloudinary';
import PinList from '@/components/PinList';
import NormalView from '@/components/NormalView';
import ImprovedModal from '@/components/ImprovedModal';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import LoadingIndicator from '@/components/LoadingIndicator';
import ImageUploader from '@/components/ImageUploader';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

// 型定義
type Map = {
  id: string;
  title: string;
  description: string;
  is_publicly_editable: boolean;
  created_at: string;
  updated_at: string;
};

type Floor = {
  id: string;
  map_id: string;
  floor_number: number;
  name: string;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
};

type Pin = {
  id: string;
  floor_id: string;
  title: string;
  description: string;
  x_position: number;
  y_position: number;
  created_at?: string;
  updated_at?: string;
  editor_id?: string;
  editor_nickname?: string;
  _temp?: boolean;
};

export default function MapEditPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mapId = params.mapId as string;

  // ステート
  const [mapData, setMapData] = useState<Map | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [activeFloor, setActiveFloor] = useState<Floor | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinPosition, setNewPinPosition] = useState({ x: 0, y: 0 });
  const [newPinInfo, setNewPinInfo] = useState({ title: '', description: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const [showPinList, setShowPinList] = useState(true);
  const [showAddFloorForm, setShowAddFloorForm] = useState(false);
  const [newFloor, setNewFloor] = useState({ floor_number: 1, name: '' });
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState<{
    loading: boolean;
    message: string;
    error: string | null;
  }>({
    loading: false,
    message: '',
    error: null
  });
  
  // マップ情報編集機能
  const [editingMapInfo, setEditingMapInfo] = useState(false);
  const [mapInfo, setMapInfo] = useState({
    title: '',
    description: '',
    is_publicly_editable: false
  });
  
  // 削除確認モーダルの状態
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'pin' | 'floor' | null;
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    title: ''
  });
  
  // refs
  const normalViewRef = useRef<HTMLDivElement>(null);
  
  // 認証状態をチェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // マップデータの取得
      fetchMapData();
    }
  }, [isLoading, isAuthenticated, router, mapId]);

  // マップデータを取得
  const fetchMapData = async () => {
    setLoading(true);
    try {
      // マップ情報を取得
      const mapData = await mapsAPI.getMap(mapId);
      setMapData(mapData);
      setMapInfo({
        title: mapData.title,
        description: mapData.description || '',
        is_publicly_editable: mapData.is_publicly_editable || false
      });

      // エリア情報を取得
      const floorsData = await floorsAPI.getFloors(mapId);
      setFloors(floorsData);
      
      // 最初のエリアをアクティブに設定
      if (floorsData.length > 0) {
        setActiveFloor(floorsData[0]);
      }
      
      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('データの取得中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  // 全ピンを取得する関数
  const fetchAllPins = useCallback(async () => {
    if (floors.length === 0) return;
    
    setApiStatus({
      loading: true,
      message: 'ピンデータを読み込み中...',
      error: null
    });
    
    try {
      // すべてのフロアのピンを取得
      const allPins: Pin[] = [];
      for (const floor of floors) {
        try {
          const floorPins = await pinsAPI.getPins(floor.id);
          allPins.push(...floorPins);
        } catch (error) {
          console.error(`フロア ${floor.id} のピン取得エラー:`, error);
        }
      }
      
      setPins(allPins);
      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      console.error('全ピンの取得エラー:', error);
      setApiStatus({
        loading: false,
        message: '',
        error: error instanceof Error ? error.message : 'ピンの取得に失敗しました'
      });
    }
  }, [floors]);
  
  // フロアデータ取得後に全ピンを取得
  useEffect(() => {
    if (floors.length > 0) {
      fetchAllPins();
    }
  }, [floors, fetchAllPins]);

  // アクティブなエリアを変更
  const handleFloorChange = (floor: Floor) => {
    // 同じ階層を再選択した場合は何もしない
    if (activeFloor?.id === floor.id) return;
    
    // 階層を変更
    setActiveFloor(floor);
  };

  // エリアの追加
  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapData) return;

    try {
      setApiStatus({
        loading: true,
        message: 'エリアを追加中...',
        error: null
      });
      console.log("mapData", mapData);
      console.log("newFloor", newFloor);
      const body=JSON.stringify({mapId:mapData.id, floor_number:newFloor.floor_number, name:newFloor.name});
      console.log("body", body);
      const newFloorData = await floorsAPI.createFloor(mapData.id, newFloor);
      
      // エリアリストを更新し、新しいエリアをアクティブに設定
      setFloors([...floors, newFloorData]);
      setActiveFloor(newFloorData);
      setNewFloor({ floor_number: floors.length > 0 ? Math.max(...floors.map(f => f.floor_number)) + 1 : 1, name: '' });
      setShowAddFloorForm(false);
      
      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        setApiStatus({
          loading: false,
          message: '',
          error: error.message
        });
      } else {
        setError('エリアの追加に失敗しました');
        setApiStatus({
          loading: false,
          message: '',
          error: 'エリアの追加に失敗しました'
        });
      }
    }
  };

  // エリアの削除
  const handleDeleteFloor = (floorId: string, floorName: string) => {
    // 削除確認モーダルを表示
    setDeleteConfirmState({
      isOpen: true,
      type: 'floor',
      id: floorId,
      title: floorName
    });
  };

  // ピンの削除
  const deletePin = (pinId: string, pinTitle: string) => {
    // 削除確認モーダルを表示
    setDeleteConfirmState({
      isOpen: true,
      type: 'pin',
      id: pinId,
      title: pinTitle
    });
  };

  // 削除確認のキャンセル
  const cancelDelete = () => {
    setDeleteConfirmState({
      isOpen: false,
      type: null,
      id: '',
      title: ''
    });
  };

  // 削除の実行
  const confirmDelete = async () => {
    if (!deleteConfirmState.type) return;
    
    const { type, id, title } = deleteConfirmState;
    
    setApiStatus({
      loading: true,
      message: `${type === 'pin' ? 'ピン' : 'エリア'}を削除しています...`,
      error: null
    });
    
    try {
      if (type === 'pin') {
        // 楽観的UI更新
        setPins(pins.filter(pin => pin.id !== id));
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedPin(null);
        
        // APIを呼び出してピンを削除
        await pinsAPI.deletePin(id);
        
        setApiStatus({
          loading: false,
          message: '',
          error: null
        });
        
        // 成功通知
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'ピンを削除しました';
        document.body.appendChild(notification);
        
        // 3秒後に通知を削除
        setTimeout(() => {
          notification.remove();
        }, 3000);
      } else if (type === 'floor') {
        // 削除するフロアと関連ピンをバックアップ
        const floorToDelete = floors.find(floor => floor.id === id);
        const relatedPins = pins.filter(pin => pin.floor_id === id);
        
        if (!floorToDelete) {
          setApiStatus({
            loading: false,
            message: '',
            error: '削除するエリアが見つかりません'
          });
          return;
        }
        
        // UI上でフロアと関連ピンを先に非表示（楽観的UI更新）
        setFloors(prevFloors => prevFloors.filter(floor => floor.id !== id));
        setPins(prevPins => prevPins.filter(pin => pin.floor_id !== id));
        
        // 削除したエリアがアクティブだった場合、別のエリアをアクティブに設定
        if (activeFloor?.id === id) {
          const updatedFloors = floors.filter(floor => floor.id !== id);
          if (updatedFloors.length > 0) {
            setActiveFloor(updatedFloors[0]);
          } else {
            setActiveFloor(null);
          }
        }
        
        // APIを呼び出してフロアを削除
        await floorsAPI.deleteFloor(id);
        
        setApiStatus({
          loading: false,
          message: '',
          error: null
        });
        
        // 成功通知
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'エリアを削除しました';
        document.body.appendChild(notification);
        
        // 3秒後に通知を削除
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('削除処理エラー:', error);
      setApiStatus({
        loading: false,
        message: '',
        error: error instanceof Error ? error.message : '削除に失敗しました'
      });
    } finally {
      // モーダルを閉じる
      cancelDelete();
    }
  };

  // 画像アップロード処理
  const handleImageUpload = async (floorId: string, file: File) => {
    setIsImageUploading(true);
    
    try {
      // Cloudinaryにアップロード
      const imageUrl = await uploadImage(file, `maps/${mapId}/floors`);
      
      // APIを呼び出して画像URLを更新
      await floorsAPI.updateFloorImage(floorId, imageUrl);
      
      // エリアリストを更新
      setFloors(prevFloors => prevFloors.map(floor => 
        floor.id === floorId ? {...floor, image_url: imageUrl} : floor
      ));
      
      // アクティブなエリアが更新された場合、アクティブなエリアも更新
      if (activeFloor?.id === floorId) {
        setActiveFloor(prevFloor => prevFloor ? {...prevFloor, image_url: imageUrl} : null);
      }
      
      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      let errorMessage = '画像のアップロードに失敗しました';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setApiStatus({
        loading: false,
        message: '',
        error: errorMessage
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  // 写真上でクリックした位置にピンを追加するモードを切り替える
  const toggleAddPinMode = () => {
    setIsAddingPin(!isAddingPin);
  };

  // 画像クリック時のピン追加処理
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, exactPosition: { x: number, y: number } | null) => {
    if (!isAddingPin) return;
    
    let position = exactPosition;
    
    if (!position) {
      // 通常のクリック位置計算（フォールバック）
      const targetFloorId = activeFloor?.id;
      if (!targetFloorId) return;
      
      // コンテナからの相対位置を計算
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      position = { x, y };
    }
    
    // 位置情報を更新
    setNewPinPosition(position);
    setNewPinInfo({ title: '', description: '' });
    setIsFormOpen(true);
  };

  // 新しいピンの情報を保存
  const savePin = async () => {
    if (!activeFloor || newPinInfo.title.trim() === '') return;
    
    try {
      setApiStatus({
        loading: true,
        message: 'ピンを追加中...',
        error: null
      });
      
      // 一時的なピンをUIに追加（楽観的UI更新）
      const tempId = `temp-${Date.now()}`;
      const tempPin: Pin = {
        id: tempId,
        floor_id: activeFloor.id,
        title: newPinInfo.title,
        description: newPinInfo.description,
        x_position: newPinPosition.x,
        y_position: newPinPosition.y,
        _temp: true
      };
      
      setPins(prevPins => [...prevPins, tempPin]);
      setNewPinInfo({ title: '', description: '' });
      setIsFormOpen(false);
      setIsAddingPin(false);
      
      // APIを呼び出してピンを作成
      console.log("activeFloor.id", activeFloor.id);
      console.log("newPinInfo", newPinInfo);
      console.log("newPinPosition", newPinPosition);
      const body=JSON.stringify({floor_id:activeFloor.id, title:newPinInfo.title, description:newPinInfo.description, x_position:newPinPosition.x, y_position:newPinPosition.y,image_url:activeFloor.image_url});
      console.log("body", body);
      const newPin = await pinsAPI.createPin(activeFloor.id, body);
      
      // 一時ピンを実際のピンに置き換え
      setPins(prevPins => prevPins.filter(pin => !pin._temp).concat(newPin));
      
      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      // 一時ピンを削除（失敗時）
      setPins(prevPins => prevPins.filter(pin => !pin._temp));
      
      setApiStatus({
        loading: false,
        message: '',
        error: error instanceof Error ? error.message : 'ピンの追加に失敗しました'
      });
    }
  };

  // ピンをクリックしたときの処理
  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    setIsModalOpen(true);
  };

  // ピンの編集を開始
  const handleEditPin = (pin: Pin) => {
    setEditingPin(pin);
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  // ピンの更新
  const updatePin = async (updatedPin: Pin) => {
    try {
      setApiStatus({
        loading: true,
        message: 'ピンを更新中...',
        error: null
      });
      
      // APIを呼び出してピンを更新
      const pinnData = await pinsAPI.updatePin(updatedPin.id, {
        title: updatedPin.title,
        description: updatedPin.description
      });
      
      // ピンリストを更新
      setPins(pins.map(pin => pin.id === pinnData.id ? pinnData : pin));
      
      // モーダルを閉じる
      setIsEditModalOpen(false);
      setSelectedPin(null);
      
      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        setApiStatus({
          loading: false,
          message: '',
          error: error.message
        });
      } else {
        setError('ピンの更新に失敗しました');
        setApiStatus({
          loading: false,
          message: '',
          error: 'ピンの更新に失敗しました'
        });
      }
    }
  };

  // マップ情報の更新関数
  const updateMapInfo = async () => {
    try {
      setApiStatus({
        loading: true,
        message: 'マップ情報を更新中...',
        error: null
      });

      const updatedMap = await mapsAPI.updateMap(mapId, mapInfo);
      setMapData(updatedMap);
      setEditingMapInfo(false);

      setApiStatus({
        loading: false,
        message: '',
        error: null
      });
    } catch (error) {
      setApiStatus({
        loading: false,
        message: '',
        error: error instanceof Error ? error.message : 'マップの更新に失敗しました'
      });
    }
  };

  // マップ情報編集フォームの入力ハンドラ
  const handleMapInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setMapInfo({ ...mapInfo, [name]: target.checked });
    } else {
      setMapInfo({ ...mapInfo, [name]: value });
    }
  };

  // フォーム入力ハンドラ
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setNewFloor({ ...newFloor, [name]: target.checked ? true : false });
    } else if (name === 'floor_number') {
      setNewFloor({ ...newFloor, [name]: parseInt(value) || 1 });
    } else {
      setNewFloor({ ...newFloor, [name]: value });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">マップ編集</h1>
        <div className="flex justify-center">
          <LoadingIndicator message="マップデータを読み込み中..." isFullScreen={false} />
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">マップ編集</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          マップが見つかりません。
        </div>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {mapData.title} の編集
          </h1>
          <div className="flex space-x-2">
            <QRCodeGenerator 
              url={`/viewer?id=${mapId}`} 
              title={`${mapData.title}_QR`}
              publicEditUrl={mapData.is_publicly_editable ? `/public-edit?id=${mapId}` : undefined}
            />
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
        
        {apiStatus.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{apiStatus.error}</span>
          </div>
        )}
        
        {apiStatus.loading && (
          <div className="mb-4">
            <LoadingIndicator 
              message={apiStatus.message} 
              isFullScreen={false} 
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側のコントロールパネル */}
          <div className="lg:col-span-1">
            {/* マップ情報 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">マップ情報</h2>
                {!editingMapInfo ? (
                  <button
                    onClick={() => setEditingMapInfo(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    編集
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMapInfo(false)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={updateMapInfo}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      保存
                    </button>
                  </div>
                )}
              </div>

              {!editingMapInfo ? (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{mapData.title}</h3>
                  <p className="text-gray-600 mt-2">{mapData.description || '説明なし'}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      mapData.is_publicly_editable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mapData.is_publicly_editable 
                        ? '公開編集有効' 
                        : '公開編集無効'}
                    </span>
                    {mapData.is_publicly_editable && (
                      <Link
                        href={`/public-edit?id=${mapId}`}
                        target="_blank"
                        className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        公開編集ページを開く
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <form>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={mapInfo.title}
                      onChange={handleMapInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      説明
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={mapInfo.description}
                      onChange={handleMapInfoChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_publicly_editable"
                        checked={mapInfo.is_publicly_editable}
                        onChange={handleMapInfoChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">公開編集を許可する</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      チェックすると、ログインしていないユーザーでもニックネームを設定してピンの追加・編集ができるようになります。
                    </p>
                  </div>
                </form>
              )}
            </div>
            {/* アクションボタン */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">アクション</h2>
              <div className="space-y-3">
                <button
                  onClick={toggleAddPinMode}
                  className={`w-full px-4 py-2 rounded-md transition-colors ${
                    isAddingPin 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={!activeFloor || !activeFloor.image_url}
                >
                  {isAddingPin ? 'ピン追加モードを終了' : 'ピンを追加'}
                </button>
                
                <button
                  onClick={() => setShowPinList(!showPinList)}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                >
                  {showPinList ? 'ピン一覧を閉じる' : 'ピン一覧を表示'}
                </button>
                
                {/* 閲覧ページへのリンク */}
                <Link
                  href={`/viewer?id=${mapId}`}
                  target="_blank"
                  className="block w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors text-center"
                >
                  閲覧ページを表示
                </Link>
              </div>
            </div>
          </div>
         
          {/* 右側の表示エリア */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  {activeFloor?.name || 'エリアを選択してください'}
                </h2>
                <button
                  onClick={() => setShowAddFloorForm(!showAddFloorForm)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md cursor-pointer"
                >
                  {showAddFloorForm ? 'キャンセル' : 'エリア追加'}
                </button>
              </div>
              
              {/* エリア追加フォーム */}
              {showAddFloorForm && (
                <form onSubmit={handleAddFloor} className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      エリア番号
                    </label>
                    <input
                      placeholder="1, 2, 3..."
                      type="number"
                      name="floor_number"
                      value={newFloor.floor_number}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      名前
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newFloor.name}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="1階, 2階など"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={apiStatus.loading}
                  >
                    {apiStatus.loading ? '処理中...' : 'エリアを追加'}
                  </button>
                </form>
              )}
              
              {/* エリアリスト */}
              <div className="mb-6">
                {floors && floors.length > 0 ? (
                  <div className="space-y-2">
                    {floors.map((floor) => (
                      <div 
                        key={floor.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          activeFloor?.id === floor.id 
                            ? 'bg-blue-100 border-l-4 border-blue-500' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div 
                          className="flex items-center flex-grow cursor-pointer"
                          onClick={() => handleFloorChange(floor)}
                        >
                          <div className="mr-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {floor.floor_number}
                            </div>
                          </div>
                          <span>{floor.name}</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <ImageUploader
                            floorId={floor.id}
                            onUploadComplete={(file) => handleImageUpload(floor.id, file)}
                            onUploadError={(message) => setError(message)}
                            currentImageUrl={floor.image_url}
                            buttonText={floor.image_url ? '変更' : '画像追加'}
                            className="px-3 py-1 rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteFloor(floor.id, floor.name);
                            }}
                            className="px-2 py-1 bg-red-400 text-white rounded text-sm hover:bg-red-500 cursor-pointer"
                            disabled={floors.length <= 1}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    エリアがありません。「エリア追加」ボタンから追加してください。
                  </div>
                )}
              </div>
              
              {/* マップビュー */}
              <div 
                ref={normalViewRef}
                className="relative bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-center items-center"
              >
                <NormalView
                  floor={activeFloor}
                  pins={pins.filter(pin => pin.floor_id === activeFloor?.id)}
                  onImageClick={handleImageClick}
                />
              </div>
            </div>
            
            {/* ピン一覧 */}
            {showPinList && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">ピン一覧</h2>
                <PinList 
                  pins={pins} 
                  floors={floors}
                  activeFloor={activeFloor?.id || null} 
                  onPinClick={handlePinClick}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* ピン情報入力モーダル */}
        <ImprovedModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setIsAddingPin(false);
          }}
          title="ピン情報を入力"
          size="md"
        >
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">タイトル</label>
            <input
              type="text"
              value={newPinInfo.title}
              onChange={(e) => setNewPinInfo({ ...newPinInfo, title: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="タイトルを入力"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">説明</label>
            <textarea
              value={newPinInfo.description}
              onChange={(e) => setNewPinInfo({ ...newPinInfo, description: e.target.value })}
              className="w-full p-2 border rounded-md h-32"
              placeholder="説明を入力"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsFormOpen(false);
                setIsAddingPin(false);
              }}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              キャンセル
            </button>
            <button
              onClick={savePin}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={apiStatus.loading}
            >
              {apiStatus.loading ? '保存中...' : '保存'}
            </button>
          </div>
        </ImprovedModal>
        
        {/* ピン情報表示モーダル */}
        <ImprovedModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPin(null);
          }}
          title={selectedPin?.title || 'ピン情報'}
          size="md"
        >
          {selectedPin && (
            <div>
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {floors.find(floor => floor.id === selectedPin.floor_id)?.name || '不明なエリア'}
                </span>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{selectedPin.description}</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deletePin(selectedPin.id, selectedPin.title);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  削除
                </button>
                
                <button
                  onClick={() => {
                    setEditingPin(selectedPin);
                    setIsEditModalOpen(true);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  編集
                </button>
              </div>
            </div>
          )}
        </ImprovedModal>

        {/* ピン編集モーダル */}
        <ImprovedModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPin(null);
          }}
          title="ピン情報を編集"
          size="md"
        >
          {editingPin && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={editingPin.title}
                  onChange={(e) => setEditingPin({ ...editingPin, title: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="タイトルを入力"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">説明</label>
                <textarea
                  value={editingPin.description}
                  onChange={(e) => setEditingPin({ ...editingPin, description: e.target.value })}
                  className="w-full p-2 border rounded-md h-32"
                  placeholder="説明を入力"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPin(null);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    updatePin(editingPin);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={apiStatus.loading}
                >
                  {apiStatus.loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}
        </ImprovedModal>
        
        {/* 削除確認モーダル */}
        <DeleteConfirmationModal
          isOpen={deleteConfirmState.isOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title={`${deleteConfirmState.type === 'pin' ? 'ピン' : 'エリア'}の削除`}
          message={`この${deleteConfirmState.type === 'pin' ? 'ピン' : 'エリア'}を削除してもよろしいですか？${
            deleteConfirmState.type === 'floor' ? 'このエリアに関連するすべてのピンも削除されます。' : ''
          }`}
          itemName={deleteConfirmState.title}
        />
      </div>
    </div>
  );
}