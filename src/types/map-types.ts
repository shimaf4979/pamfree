// types/map-types.ts

export type Map = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_publicly_editable: boolean;
};

  
export type Floor = {
  id: string;
  map_id: string;
  floor_number: number;
  name: string;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
};

  // types/map-types.ts に追加
export type MapData = {
  id: string;
  map_id: string;
  title: string;
  description: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_publicly_editable?: boolean; // 公開編集フラグを追加
  editor_id?: string;        // 編集者ID
  editor_nickname?: string;  // 編集者名
};

// 公開編集者情報を追加
export type PublicEditor = {
  id: string;
  map_id: string;
  nickname: string;
  token: string;
  created_at?: string;
  last_active?: string;
};

// Pin型に編集者情報を追加
export type Pin = {
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
  _updating?: boolean;
  _temp?: boolean;
};
