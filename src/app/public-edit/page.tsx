'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { viewerAPI, publicEditAPI } from '@/lib/api-client';
import { uploadImage } from '@/utils/cloudinary';
import ImprovedModal from '@/components/ImprovedModal';
import LoadingIndicator from '@/components/LoadingIndicator';

// 型定義
type Map = {
  id: string;
  map_id: string;
  title: string;
  description: string;
  is_publicly_editable: boolean;
};

type Floor = {
  id: string;
  map_id: string;
  floor_number: number;
  name: string;
  image_url: string | null;
};

type Pin = {
  id: string;
  floor_id: string;
  title: string;
  description: string;
  x_position: number;
  y_position: number;
  editor_id?: string;
  editor_nickname?: string;
  _temp?: boolean;
};

type PublicEditor = {
  id: string;
  map_id: string;
  nickname: string;
  token: string;
};

function PublicEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapId = searchParams.get('id') || '';
  
  // 基本状態
  const [mapData, setMapData] = useState<Map | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [activeFloor, setActiveFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // 公開編集状態
  const [editorInfo, setEditorInfo] = useState<PublicEditor | null>(null);
  const [nickname, setNickname] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinPosition, setNewPinPosition] = useState({ x: 0, y: 0 });
  const [newPinInfo, setNewPinInfo] = useState({ title: '', description: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const [isDeletingPin, setIsDeletingPin] = useState(false);
  
  // レスポンシブ対応
  const [isMobile, setIsMobile] = useState(false);
  
  // コンテナへの参照
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // スマホ検出のためのuseEffect
  useEffect(() => {
    const checkIfMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    
    checkIfMobile();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIfMobile);
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, []);

  // 既存の編集者情報をローカルストレージから取得
  useEffect(() => {
    if (!mapId) {
      setError('マップIDが指定されていません');
      setLoading(false);
      return;
    }
    
    const STORAGE_PREFIX = 'public_edit_';
    
    // ローカルストレージから編集者情報を取得
    const getEditorFromStorage = (): PublicEditor | null => {
      try {
        const editorData = localStorage.getItem(`${STORAGE_PREFIX}${mapId}`);
        return editorData ? JSON.parse(editorData) : null;
      } catch (error) {
        console.error('編集者情報の取得に失敗しました:', error);
        return null;
      }
    };
    
    const savedEditor = getEditorFromStorage();
    if (savedEditor) {
      // トークンの検証
      verifyEditorToken(savedEditor);
    } else {
      // 保存された情報がない場合はモーダルを表示
      setShowNicknameModal(true);
    }
  }, [mapId]);

  // トークンの検証
  const verifyEditorToken = async (editor: PublicEditor) => {
    try {
      const { verified, editorId, nickname, token } = await publicEditAPI.verifyToken(editor.id, editor.token);
      
      if (verified) {
        setEditorInfo({
          id: editorId,
          map_id: mapId,
          nickname,
          token
        });
      } else {
        // 無効なトークンの場合はモーダルを表示
        setShowNicknameModal(true);
      }
    } catch (error) {
      console.error('トークン検証エラー:', error);
      setShowNicknameModal(true);
    }
  };

  // マップデータの読み込み
  useEffect(() => {
    if (!mapId) return;
    
    const fetchMapData = async () => {
      try {
        setLoading(true);
        
        // APIからマップデータを取得
        const data = await viewerAPI.getMapData(mapId);
        
        // 公開編集が有効かチェック
        if (!data.map.is_publicly_editable) {
          throw new Error('このマップは公開編集が許可されていません');
        }
        
        // データを設定
        setMapData(data.map);
        setFloors(data.floors);
        
        // 編集者情報が欠落しているピンには「不明な編集者」を設定
        const pinsWithEditors = data.pins.map((pin: Pin) => {
          if (!pin.editor_nickname) {
            return {
              ...pin,
              editor_nickname: '不明な編集者'
            };
          }
          return pin;
        });
        
        setPins(pinsWithEditors);
        
        // 最初のエリアをアクティブに設定
        if (data.floors && data.floors.length > 0) {
          setActiveFloor(data.floors[0]);
        }
        
        setError(null);
      } catch (error) {
        console.error('データの取得エラー:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('データの取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
  }, [mapId]);

  // 公開編集者の登録
  const registerEditor = async () => {
    if (!mapId || !nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    
    try {
      setLoading(true);
      
      const { editorId, nickname: registeredNickname, token } = await publicEditAPI.registerEditor(mapId, nickname);
      
      // ローカルストレージに保存
      const editor = {
        id: editorId,
        map_id: mapId,
        nickname: registeredNickname,
        token
      };
      
      localStorage.setItem(`public_edit_${mapId}`, JSON.stringify(editor));
      
      setEditorInfo(editor);
      setShowNicknameModal(false);
      setMessage('編集者として登録しました。ピンを追加・編集できるようになりました。');
      
      // 3秒後にメッセージを消す
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('編集者登録エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('編集者の登録に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  // 写真上でクリックした位置にピンを追加するモードを切り替える
  const toggleAddPinMode = () => {
    setIsAddingPin(!isAddingPin);
    
    // ピン追加モードを終了するときは選択状態をクリア
    if (isAddingPin) {
      setSelectedPin(null);
    }
  };

  // 画像クリック時のピン追加処理
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin || !editorInfo || !activeFloor) return;
    
    // コンテナRef
    const containerRef = imageContainerRef.current;
    if (!containerRef) return;
    
    // クリック位置を取得
    const rect = containerRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // 位置情報を更新
    setNewPinPosition({ x, y });
    setNewPinInfo({ title: '', description: '' });
    setIsFormOpen(true);
  };

  // 新しいピンの情報を保存
  const savePin = async () => {
    if (!activeFloor || !editorInfo || newPinInfo.title.trim() === '') {
      setError('タイトルは必須です');
      return;
    }
    
    try {
      // 一時的なピンをUIに追加（楽観的UI更新）
      const tempId = `temp-${Date.now()}`;
      const tempPin: Pin = {
        id: tempId,
        floor_id: activeFloor.id,
        title: newPinInfo.title,
        description: newPinInfo.description,
        x_position: newPinPosition.x,
        y_position: newPinPosition.y,
        editor_id: editorInfo.id,
        editor_nickname: editorInfo.nickname,
        _temp: true
      };
      
      setPins(prevPins => [...prevPins, tempPin]);
      setNewPinInfo({ title: '', description: '' });
      setIsFormOpen(false);
      setIsAddingPin(false);
      
      // APIリクエスト
      const { pin } = await publicEditAPI.createPin({
        floor_id: activeFloor.id,
        title: newPinInfo.title,
        description: newPinInfo.description,
        x_position: newPinPosition.x,
        y_position: newPinPosition.y,
        editor_id: editorInfo.id,
        editor_nickname: editorInfo.nickname
      });
      
      // 一時ピンを実際のピンに置き換え
      setPins(prevPins => prevPins.filter(p => !p._temp).concat([pin]));
      
      setMessage('ピンを追加しました');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      // 一時ピンを削除（失敗時）
      setPins(prevPins => prevPins.filter(p => !p._temp));
      
      console.error('ピン追加エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ピンの追加に失敗しました');
      }
    }
  };

  // ピンをクリックしたときの処理
  const handlePinClick = (pin: Pin) => {
    // 既に選択中のピンをクリックした場合は選択を解除
    if (selectedPin && selectedPin.id === pin.id) {
      setSelectedPin(null);
    } else {
      // 新しいピンを選択
      setSelectedPin(pin);
      setIsViewModalOpen(true);
    }
  };

  // ピンの編集を開始
  const handleEditPin = (pin: Pin) => {
    if (!editorInfo || pin.editor_id !== editorInfo.id) {
      setError('他のユーザーが作成したピンは編集できません');
      return;
    }
    
    setEditingPin(pin);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  // ピンの更新
  const updatePin = async () => {
    if (!editingPin || !editorInfo) return;
    
    try {
      // 楽観的UI更新
      const updatedPins = pins.map(p => 
        p.id === editingPin.id ? editingPin : p
      );
      setPins(updatedPins);
      
      // APIリクエスト
      await publicEditAPI.updatePin(editingPin.id, {
        title: editingPin.title,
        description: editingPin.description,
        editorId: editorInfo.id
      });
      
      setIsEditModalOpen(false);
      setMessage('ピンを更新しました');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('ピン更新エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ピンの更新に失敗しました');
      }
    }
  };

  // ピンの削除
  const deletePin = async () => {
    if (!selectedPin || !editorInfo) return;
    
    try {
      setIsDeletingPin(true);
      
      if (selectedPin.editor_id !== editorInfo.id) {
        throw new Error('他のユーザーが作成したピンは削除できません');
      }
      
      // 楽観的UI更新
      setPins(prevPins => prevPins.filter(p => p.id !== selectedPin.id));
      
      // APIリクエスト
      await publicEditAPI.deletePin(selectedPin.id, editorInfo.id);
      
      setIsViewModalOpen(false);
      setSelectedPin(null);
      setMessage('ピンを削除しました');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('ピン削除エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ピンの削除に失敗しました');
      }
    } finally {
      setIsDeletingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator message="読み込み中..." isFullScreen={false} />
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">エラー</h2>
          <p className="text-gray-600 mb-4">
            {error || 'マップが見つかりません。'}
          </p>
          <Link href="/" className="text-blue-500 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{mapData.title}</h1>
            {mapData.description && (
              <p className="text-gray-600">{mapData.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {editorInfo ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {editorInfo.nickname}で編集中
              </div>
            ) : (
              <button
                onClick={() => setShowNicknameModal(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
              >
                ニックネーム設定
              </button>
            )}
            
            <Link
              href={`/viewer?id=${mapId}`}
              className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              閲覧モード
            </Link>
          </div>
        </div>
        
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側のコントロールパネル */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">フロア選択</h2>
              
              {/* エリア選択 */}
              <div className="mb-6">
                {floors.length > 0 ? (
                  <div className="space-y-2">
                    {floors.map((floor) => (
                      <div 
                        key={floor.id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          activeFloor?.id === floor.id 
                            ? 'bg-blue-100 border-l-4 border-blue-500' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveFloor(floor)}
                      >
                        <div className="mr-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {floor.floor_number}
                          </div>
                        </div>
                        <span>{floor.name}</span>
                        
                        {floor.image_url && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    エリア情報がありません
                  </div>
                )}
              </div>
              
              {/* アクションボタン */}
              <div className="space-y-3">
                {editorInfo && (
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
                )}
              </div>
            </div>
          </div>
          
          {/* 右側の表示エリア */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {activeFloor?.name || 'エリアを選択してください'}
              </h2>
              
              <div 
                ref={imageContainerRef}
                className="relative bg-gray-100 rounded-lg overflow-hidden"
                onClick={isAddingPin ? handleImageClick : undefined}
                style={{ cursor: isAddingPin ? 'crosshair' : 'default' }}
              >
                {activeFloor && activeFloor.image_url ? (
                  <div className="w-full h-96 relative">
                    <img 
                      src={activeFloor.image_url} 
                      alt={activeFloor.name}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* ピン表示 */}
                    {pins
                      .filter(pin => pin.floor_id === activeFloor.id)
                      .map((pin) => (
                        <button
                          key={pin.id}
                          onClick={() => handlePinClick(pin)}
                          className={`absolute transform -translate-x-1/2 -translate-y-full ${
                            selectedPin?.id === pin.id ? 'z-30' : 'z-20'
                          }`}
                          style={{
                            left: `${pin.x_position}%`,
                            top: `${pin.y_position}%`,
                          }}
                        >
                          <div className="w-6 h-12 relative flex flex-col items-center">
                            {/* ピンのヘッド部分 */}
                            <div className={`w-6 h-6 ${
                              pin.editor_id === editorInfo?.id
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-red-500 hover:bg-red-600'
                            } rounded-full flex items-center justify-center text-white 
                                      shadow-md transition-all duration-200 border-2 border-white
                                      hover:scale-110 ${selectedPin?.id === pin.id ? 'ring-2 ring-blue-500 scale-110' : ''}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            
                            {/* ピンの棒部分 */}
                            <div className="absolute flex flex-col items-center">
                              <div className={`h-4 w-2 ${
                                pin.editor_id === editorInfo?.id ? 'bg-green-600' : 'bg-red-600'
                              } rounded-b-none mt-4`}></div>
                              <div className={`h-3 w-2 ${
                                pin.editor_id === editorInfo?.id ? 'bg-green-700' : 'bg-red-700'
                              } clip-path-triangle`}></div>
                            </div>
                            
                            {/* ピンの影 */}
                            <div className="absolute bottom-0 w-4 h-1 bg-black/30 rounded-full blur-sm"></div>
                          </div>
                        </button>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 h-96">
                    <p className="text-gray-500">
                      {!activeFloor ? 'エリアを選択してください' : '画像がありません'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* ピン一覧 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">ピン一覧</h2>
              
              {pins.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pins
                    .filter(pin => !activeFloor || pin.floor_id === activeFloor.id)
                    .map((pin) => {
                      const floor = floors.find(f => f.id === pin.floor_id);
                      return (
                        <div
                          key={pin.id}
                          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                            selectedPin?.id === pin.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => handlePinClick(pin)}
                        >
                          <div className="flex items-start">
                            <div className="mr-2">
                              <div className={`w-3 h-3 rounded-full ${
                                pin.editor_id === editorInfo?.id ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-medium text-gray-900">{pin.title}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{pin.description}</p>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <span className="mr-2">{floor?.name || '不明なエリア'}</span>
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {pin.editor_nickname || '不明な編集者'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  ピンがありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* ニックネーム入力モーダル */}
      <ImprovedModal
        isOpen={showNicknameModal}
        onClose={() => {
          if (editorInfo) {
            setShowNicknameModal(false);
          }
        }}
        title="ニックネームを設定"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4 text-gray-600">
            このマップを編集するために、ニックネームを設定してください。
          </p>
          <div className="mb-4">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：山田太郎"
              required
            />
          </div>
          <button
            onClick={registerEditor}
            disabled={!nickname.trim() || loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : '編集を始める'}
          </button>
        </div>
      </ImprovedModal>
      
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
          <label htmlFor="pin-title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            id="pin-title"
            value={newPinInfo.title}
            onChange={(e) => setNewPinInfo({ ...newPinInfo, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="タイトルを入力"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="pin-description" className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            id="pin-description"
            value={newPinInfo.description}
            onChange={(e) => setNewPinInfo({ ...newPinInfo, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
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
            disabled={!newPinInfo.title.trim()}
          >
            保存
          </button>
        </div>
      </ImprovedModal>
      
      {/* ピン詳細表示モーダル */}
      <ImprovedModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPin(null);
        }}
        title={selectedPin?.title || 'ピン詳細'}
        size="md"
      >
        {selectedPin && (
          <div>
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {floors.find(floor => floor.id === selectedPin.floor_id)?.name || '不明なエリア'}
              </span>
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-2">
                作成者: {selectedPin.editor_nickname || '不明な編集者'}
              </span>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{selectedPin.description}</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              {editorInfo && selectedPin.editor_id === editorInfo.id && (
                <>
                  <button
                    onClick={deletePin}
                    disabled={isDeletingPin}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                  >
                    {isDeletingPin ? '削除中...' : '削除'}
                  </button>
                  
                  <button
                    onClick={() => handleEditPin(selectedPin)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    編集
                  </button>
                </>
              )}
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
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                id="edit-title"
                value={editingPin.title}
                onChange={(e) => setEditingPin({ ...editingPin, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="タイトルを入力"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                id="edit-description"
                value={editingPin.description}
                onChange={(e) => setEditingPin({ ...editingPin, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
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
                onClick={updatePin}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!editingPin.title.trim()}
              >
                保存
              </button>
            </div>
          </div>
        )}
      </ImprovedModal>
    </main>
  );
}

export default function PublicEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    }>
      <PublicEditContent />
    </Suspense>
  );
}