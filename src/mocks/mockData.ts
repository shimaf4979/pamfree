// src/mocks/mockData.ts
import { Floor, Pin, MapData } from '@/types/map-types';

export const mockMapData: MapData = {
  id: 'test-map-001',
  map_id: 'test-map',
  title: 'テストマップ',
  description: 'テスト用のマップです',
  is_publicly_editable: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockFloors: Floor[] = [
  {
    id: 'floor-1',
    map_id: 'test-map-001',
    floor_number: 1,
    name: '1階',
    image_url: '/placeholder-image.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'floor-2',
    map_id: 'test-map-001',
    floor_number: 2,
    name: '2階',
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockPins: Pin[] = [
  {
    id: 'pin-1',
    floor_id: 'floor-1',
    title: 'サンプルピン1',
    description: '最初のサンプルピンの説明',
    x_position: 30,
    y_position: 40,
    editor_id: 'user-1',
    editor_nickname: '山田太郎',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pin-2',
    floor_id: 'floor-1',
    title: 'サンプルピン2',
    description: '2番目のサンプルピンの説明\n複数行の説明も可能です。',
    x_position: 60,
    y_position: 70,
    editor_id: 'user-2',
    editor_nickname: '佐藤花子',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// src/mocks/mockData.ts に追加または修正
export const mockPinMarkers = [
  {
    id: 'pin1',
    // デフォルト値を明示的に設定
    x: 50, // 0-100の範囲のデフォルト値
    y: 50, // 0-100の範囲のデフォルト値
    title: 'サンプルピン',
    description: 'デフォルトの説明文',
  },
];
