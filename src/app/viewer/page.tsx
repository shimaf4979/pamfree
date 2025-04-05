'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { viewerAPI } from '@/lib/api-client';
import PinList from '@/components/PinList';
import NormalView from '@/components/NormalView';
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
};

function ViewerContent() {
  const searchParams = useSearchParams();
  const mapId = searchParams.get('id') || '';
  
  const [mapData, setMapData] = useState<Map | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [activeFloor, setActiveFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // ピン選択状態の管理
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // コンテナへの参照
  const normalViewRef = useRef<HTMLDivElement>(null);
  
  // レスポンシブ対応
  const [isMobile, setIsMobile] = useState(false);
  
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

  // データ読み込み
  useEffect(() => {
    if (!mapId) {
      setError('マップIDが指定されていません');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingProgress(10); // 開始時の進捗表示
        
        // マップデータを取得
        const data = await viewerAPI.getMapData(mapId);
        setLoadingProgress(50); // データ取得完了
        
        // データを設定
        setMapData(data.map);
        setFloors(data.floors);
        
        // ピンデータを処理（編集者情報を確認）
        const processedPins = data.pins.map((pin: Pin) => {
          // 編集者情報がないピンにはデフォルト値を設定
          if (!pin.editor_nickname && !pin.editor_id) {
            return {
              ...pin,
              editor_nickname: '不明な編集者'
            };
          }
          return pin;
        });
        
        setPins(processedPins);
        
        // 最初のエリアをアクティブに設定
        if (data.floors && data.floors.length > 0) {
          setActiveFloor(data.floors[0]);
        }
        
        setLoadingProgress(100); // 完了
        setError(null);
      } catch (error) {
        console.error('データの取得エラー:', error);
        setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mapId]);

  // エリアの変更
  const handleFloorChange = (floor: Floor) => {
    setActiveFloor(floor);
    
    // ピンが選択されていれば解除
    if (selectedPinId) {
      setSelectedPinId(null);
      setSelectedPin(null);
      setIsModalOpen(false);
    }
  };

  // ピンをクリックしたときの処理
  const handlePinClick = (pin: Pin) => {
    // 既に選択中のピンをクリックした場合は選択を解除
    if (selectedPinId === pin.id) {
      setSelectedPinId(null);
      setSelectedPin(null);
      setIsModalOpen(false);
    } else {
      // 新しいピンを選択
      setSelectedPinId(pin.id);
      setSelectedPin(pin);
      setIsModalOpen(true);
      
      // ピンがあるフロアをアクティブにする
      const pinFloor = floors.find(floor => floor.id === pin.floor_id);
      if (pinFloor && pinFloor.id !== activeFloor?.id) {
        setActiveFloor(pinFloor);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingIndicator 
            progress={loadingProgress} 
            message="データを読み込み中..."
            isFullScreen={false}
          />
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {mapData.is_publicly_editable && (
            <Link
              href={`/public-edit?id=${mapId}`}
              className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              公開編集モードへ
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側のコントロールパネル */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">エリア選択</h2>
              
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
                        onClick={() => handleFloorChange(floor)}
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
            </div>
          </div>
          
          {/* 右側の表示エリア */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {activeFloor?.name || 'エリアを選択してください'}
              </h2>
              
              <div 
                ref={normalViewRef}
                className="relative bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-center items-center"
              >
                <NormalView
                  floor={activeFloor}
                  pins={pins.filter(pin => pin.floor_id === activeFloor?.id)}
                />
              </div>
            </div>
          
            {/* ピン一覧 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">ピン一覧</h2>
              <PinList 
                pins={pins} 
                floors={floors}
                activeFloor={activeFloor?.id || null} 
                onPinClick={handlePinClick}
                selectedPinId={selectedPinId}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* ピン情報表示モーダル */}
      <ImprovedModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPinId(null);
          setSelectedPin(null);
        }}
        title={selectedPin?.title || 'ピン情報'}
        size="md"
      >
        {selectedPin && (
          <div>
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                {floors.find(floor => floor.id === selectedPin.floor_id)?.name || '不明なエリア'}
              </span>
              {selectedPin.editor_nickname && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {selectedPin.editor_nickname}
                </span>
              )}
            </div>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{selectedPin.description}</p>
            </div>
          </div>
        )}
      </ImprovedModal>
    </main>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}