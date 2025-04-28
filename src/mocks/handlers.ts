// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockMapData, mockFloors, mockPins } from './mockData';

export const handlers = [
  // マップデータ取得
  http.get('/api/maps/:mapId', ({ params }) => {
    return HttpResponse.json(mockMapData);
  }),

  // フロア一覧取得
  http.get('/api/maps/:mapId/floors', () => {
    return HttpResponse.json(mockFloors);
  }),

  // 特定のフロアのピン一覧取得
  http.get('/api/floors/:floorId/pins', ({ params }) => {
    const floorId = params.floorId as string;
    return HttpResponse.json(mockPins.filter((pin) => pin.floor_id === floorId));
  }),

  // ビューアデータ取得
  http.get('/api/viewer/:mapId', () => {
    return HttpResponse.json({
      map: mockMapData,
      floors: mockFloors,
      pins: mockPins,
    });
  }),
];
