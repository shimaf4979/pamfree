import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-clients';
import { MapData, Floor, Pin, PublicEditor } from '@/types/map-types';

// キャッシュキーの定義
export const QUERY_KEYS = {
  MAPS: 'maps',
  MAP: (id: string) => ['map', id],
  FLOORS: (mapId: string) => ['floors', mapId],
  FLOOR: (id: string) => ['floor', id],
  PINS: (floorId: string) => ['pins', floorId],
  PIN: (id: string) => ['pin', id],
  VIEWER: (mapId: string) => ['viewer', mapId],
  USERS: 'users',
};

// ---------- マップ関連のフック ----------

// マップ一覧の取得
export function useMaps() {
  return useQuery({
    queryKey: [QUERY_KEYS.MAPS],
    queryFn: async () => {
      return apiRequest<MapData[]>('/maps', 'GET');
    },
  });
}

// 特定のマップの取得
export function useMap(mapId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MAP(mapId),
    queryFn: async () => {
      return apiRequest<MapData>(`/maps/${mapId}`, 'GET');
    },
    enabled: !!mapId,
  });
}

// マップの作成
export function useCreateMap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mapData: Partial<MapData>) => {
      return apiRequest<MapData, Partial<MapData>>('/maps', 'POST', mapData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAPS] });
    },
  });
}

// マップの更新
export function useUpdateMap(mapId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mapData: Partial<MapData>) => {
      return apiRequest<MapData, Partial<MapData>>(`/maps/${mapId}`, 'PATCH', mapData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAP(mapId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAPS] });
    },
  });
}

// マップの削除
export function useDeleteMap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mapId: string) => {
      return apiRequest(`/maps/${mapId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAPS] });
    },
  });
}

// ---------- フロア関連のフック ----------

// マップに属するフロア一覧の取得
export function useFloors(mapId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.FLOORS(mapId),
    queryFn: async () => {
      return apiRequest<Floor[]>(`/maps/${mapId}/floors`, 'GET');
    },
    enabled: !!mapId,
  });
}

// フロアの作成
export function useCreateFloor(mapId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (floorData: Partial<Floor>) => {
      return apiRequest<Floor, Partial<Floor>>(`/maps/${mapId}/floors`, 'POST', floorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLOORS(mapId) });
    },
  });
}

// フロアの更新
export function useUpdateFloor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ floorId, data }: { floorId: string; data: Partial<Floor> }) => {
      return apiRequest<Floor, Partial<Floor>>(`/floors/${floorId}`, 'PATCH', data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLOOR(variables.floorId) });
      // フロアが所属するマップのフロア一覧も更新
      // 注: ここではマップIDが分からないため、別途ロジックが必要かもしれません
    },
  });
}

// フロアの削除
export function useDeleteFloor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (floorId: string) => {
      return apiRequest(`/floors/${floorId}`, 'DELETE');
    },
    onSuccess: (_, floorId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLOOR(floorId) });
      // フロアが所属するマップのフロア一覧も更新
      // 注: ここではマップIDが分からないため、別途ロジックが必要かもしれません
    },
  });
}

// フロアの画像アップロード
export function useUploadFloorImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ floorId, formData }: { floorId: string; formData: FormData }) => {
      return apiRequest<{ image_url: string }>(`/floors/${floorId}/image`, 'POST', formData, {
        'Content-Type': 'multipart/form-data',
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLOOR(variables.floorId) });
    },
  });
}

// ---------- ピン関連のフック ----------

// フロアに属するピン一覧の取得
export function usePins(floorId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PINS(floorId),
    queryFn: async () => {
      return apiRequest<Pin[]>(`/floors/${floorId}/pins`, 'GET');
    },
    enabled: !!floorId,
  });
}

// ピンの作成
export function useCreatePin(floorId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pinData: Partial<Pin>) => {
      return apiRequest<Pin, Partial<Pin>>(`/floors/${floorId}/pins`, 'POST', pinData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PINS(floorId) });
    },
  });
}

// ピンの更新
export function useUpdatePin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pinId, data }: { pinId: string; data: Partial<Pin> }) => {
      return apiRequest<Pin, Partial<Pin>>(`/pins/${pinId}`, 'PATCH', data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PIN(variables.pinId) });
      // このピンが所属するフロアのピン一覧も更新
      // 注: ここではフロアIDが分からないため、別途ロジックが必要かもしれません
    },
  });
}

// ピンの削除
export function useDeletePin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pinId: string) => {
      return apiRequest(`/pins/${pinId}`, 'DELETE');
    },
    onSuccess: (_, pinId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PIN(pinId) });
      // このピンが所属するフロアのピン一覧も更新
      // 注: ここではフロアIDが分からないため、別途ロジックが必要かもしれません
    },
  });
}

// ---------- ビューワー関連のフック ----------

// マップの全データを取得（公開ビュー用）
export function useViewerData(mapId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.VIEWER(mapId),
    queryFn: async () => {
      return apiRequest<{
        map: MapData;
        floors: Floor[];
        pins: Pin[];
      }>(`/viewer/${mapId}`, 'GET');
    },
    enabled: !!mapId,
  });
}

// ---------- 公開編集関連のフック ----------

// 公開編集者の登録
export function useRegisterPublicEditor() {
  return useMutation({
    mutationFn: (data: { mapId: string; nickname: string }) => {
      return apiRequest<PublicEditor, typeof data>('/public-edit/register', 'POST', data);
    },
  });
}

// 公開編集者のトークン検証
export function useVerifyPublicEditor() {
  return useMutation({
    mutationFn: (data: { editorId: string; token: string }) => {
      return apiRequest<{ verified: boolean; editorInfo?: PublicEditor }, typeof data>(
        '/public-edit/verify',
        'POST',
        data
      );
    },
  });
}

// 公開編集でピンを作成
export function useCreatePublicPin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      floorId: string;
      title: string;
      description: string;
      x_position: number;
      y_position: number;
      editorId: string;
      nickname: string;
    }) => {
      return apiRequest<Pin, typeof data>('/public-edit/pins', 'POST', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PINS(data.floor_id) });
    },
  });
}

// 公開編集でピンを更新
export function useUpdatePublicPin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      pinId: string;
      title: string;
      description: string;
      editorId: string;
    }) => {
      return apiRequest<Pin, typeof data>(`/public-edit/pins/${data.pinId}`, 'PATCH', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PIN(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PINS(data.floor_id) });
    },
  });
}

// 公開編集でピンを削除
export function useDeletePublicPin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pinId, editorId }: { pinId: string; editorId: string }) => {
      return apiRequest(`/public-edit/pins/${pinId}?editorId=${editorId}`, 'DELETE');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PIN(variables.pinId) });
      // このピンが所属するフロアのピン一覧も更新
      // 注: ここではフロアIDが分からないため、別途ロジックが必要かもしれません
    },
  });
}

// ---------- アカウント関連のフック ----------

// ユーザープロフィールの更新
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { name: string }) => {
      return apiRequest('/account/update-profile', 'PATCH', data);
    },
  });
}

// パスワードの変更
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest('/account/change-password', 'POST', data);
    },
  });
}

// ---------- 管理者関連のフック ----------

// 全ユーザーリストの取得
export function useUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: async () => {
      return apiRequest('/admin/users', 'GET');
    },
  });
}

// ユーザーロールの更新
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest(`/admin/users/${userId}`, 'PATCH', { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
}

// ユーザーの削除
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => {
      return apiRequest(`/admin/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
}