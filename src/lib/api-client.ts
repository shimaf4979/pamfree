// lib/api-client.ts
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const API_BASE_URL = 'https://api.pamfree.com/api';

/**
 * APIリクエストを送信する
 */
export const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // デフォルトのヘッダーを設定
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // 認証トークンがあれば設定
  const token = getCookie('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // リクエストオプションを設定
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // 認証関連のエラー処理
    if (response.status === 401) {
      // 認証トークンをクリア
      deleteCookie('auth_token');
      
      // クライアントサイドの場合はログインページにリダイレクト
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('認証エラー: ログインが必要です');
    }
    
    // レスポンスをJSONとして解析
    const data = await response.json();
    
    // エラーレスポンスの場合はエラーをスロー
    if (!response.ok) {
      throw new Error(data.error || 'APIリクエストに失敗しました');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
};

// 認証関連のAPI呼び出し
export const authAPI = {
  // ログイン
  login: async (email: string, password: string): Promise<any> => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // 認証トークンをCookieに保存
    if (data.token) {
      setCookie('auth_token', data.token);
    }
    
    return data;
  },
  
  // 登録
  register: async (name: string, email: string, password: string): Promise<any> => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  
  // ログアウト
  logout: async (): Promise<void> => {
    deleteCookie('auth_token');
  },
  
  // 現在のユーザー情報を取得
  getCurrentUser: async (): Promise<any> => {
    return fetchAPI('/auth/me');
  },
};

// マップ関連のAPI呼び出し
export const mapsAPI = {
  // マップ一覧を取得
  getMaps: async (): Promise<any> => {
    return fetchAPI('/maps') || [];
  },
  
  // マップを作成
  createMap: async (mapData: any): Promise<any> => {
    return fetchAPI('/maps', {
      method: 'POST',
      body: JSON.stringify(mapData),
    });
  },
  
  // マップを取得
  getMap: async (mapId: string): Promise<any> => {
    return fetchAPI(`/maps/${mapId}`) || [];
  },
  
  // マップを更新
  updateMap: async (mapId: string, mapData: any): Promise<any> => {
    return fetchAPI(`/maps/${mapId}`, {
      method: 'PATCH',
      body: JSON.stringify(mapData),
    });
  },
  
  // マップを削除
  deleteMap: async (mapId: string): Promise<any> => {
    return fetchAPI(`/maps/${mapId}`, {
      method: 'DELETE',
    });
  },
};

// フロア関連のAPI呼び出し
export const floorsAPI = {
  // フロア一覧を取得
  getFloors: async (mapId: string): Promise<any> => {
    return fetchAPI(`/maps/${mapId}/floors`) || [];
  },
  
  // フロアを作成
  createFloor: async (mapId: string, floorData: any): Promise<any> => {

    return fetchAPI(`/maps/${mapId}/floors`, {
      method: 'POST',
      body: JSON.stringify({mapId,floor_number:floorData.floor_number, name:floorData.name}),
    });
  },
  
  // フロアを取得
  getFloor: async (floorId: string): Promise<any> => {
    return fetchAPI(`/floors/${floorId}`) || [];
  },
  
  // フロアを更新
  updateFloor: async (floorId: string, floorData: any): Promise<any> => {
    return fetchAPI(`/floors/${floorId}`, {
      method: 'PATCH',
      body: JSON.stringify(floorData),
    });
  },
  
  // フロアを削除
  deleteFloor: async (floorId: string): Promise<any> => {
    return fetchAPI(`/floors/${floorId}`, {
      method: 'DELETE',
    });
  },
  
  // フロア画像を更新
  updateFloorImage: async (floorId: string, imageUrl: string): Promise<any> => {
    return fetchAPI(`/floors/${floorId}/image`, {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl }),
    });
  },
};

// ピン関連のAPI呼び出し
export const pinsAPI = {
  // ピン一覧を取得
  getPins: async (floorId: string): Promise<any> => {
    return fetchAPI(`/floors/${floorId}/pins`) || [];
  },
  
  // ピンを作成
  createPin: async (floorId: string, pinData: any): Promise<any> => {
    return fetchAPI(`/floors/${floorId}/pins`, {
      method: 'POST',
      body: pinData,
    });
  },
  
  // ピンを取得
  getPin: async (pinId: string): Promise<any> => {
    return fetchAPI(`/pins/${pinId}`) || [];
  },  
  
  // ピンを更新
  updatePin: async (pinId: string, pinData: any): Promise<any> => {
    return fetchAPI(`/pins/${pinId}`, {
      method: 'PATCH',
      body: JSON.stringify(pinData),
    });
  },
  
  // ピンを削除
  deletePin: async (pinId: string): Promise<any> => {
    return fetchAPI(`/pins/${pinId}`, {
      method: 'DELETE',
    });
  },
};

// ビューワー関連のAPI呼び出し
export const viewerAPI = {
  // マップの全データを取得
  getMapData: async (mapId: string): Promise<any> => {
    return fetchAPI(`/viewer/${mapId}`) || [];
  },
};

// 公開編集関連のAPI呼び出し
export const publicEditAPI = {
  // 公開編集者を登録
  registerEditor: async (mapId: string, nickname: string): Promise<any> => {
    return fetchAPI('/public-edit/register', {
      method: 'POST',
      body: JSON.stringify({ mapId, nickname }),
    });
  },
  
  // 公開編集者トークンを検証
  verifyToken: async (editorId: string, token: string): Promise<any> => {
    return fetchAPI('/public-edit/verify', {
      method: 'POST',
      body: JSON.stringify({ editorId, token }),
    });
  },
  
  // 公開編集でピンを作成
  createPin: async (pinData: any): Promise<any> => {
    return fetchAPI('/public-edit/pins', {
      method: 'POST',
      body: JSON.stringify(pinData),
    });
  },
  
  // 公開編集でピンを更新
  updatePin: async (pinId: string, pinData: any): Promise<any> => {
    return fetchAPI(`/public-edit/pins/${pinId}`, {
      method: 'PATCH',
      body: JSON.stringify(pinData),
    });
  },
  
  // 公開編集でピンを削除
  deletePin: async (pinId: string, editorId: string): Promise<any> => {
    return fetchAPI(`/public-edit/pins/${pinId}?editorId=${editorId}`, {
      method: 'DELETE',
    });
  },
};

// アカウント管理関連のAPI呼び出し
export const accountAPI = {
  // プロフィールを更新
  updateProfile: async (name: string): Promise<any> => {
    return fetchAPI('/account/update-profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },
  
  // パスワードを変更
  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    return fetchAPI('/account/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// 管理者機能関連のAPI呼び出し
export const adminAPI = {
  // ユーザーリストを取得
  getUsers: async (): Promise<any> => {
    return fetchAPI('/admin/users') || [];
  },
  
  // ユーザーロールを更新
  updateUserRole: async (userId: string, role: string): Promise<any> => {
    return fetchAPI(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
  
  // ユーザーを削除
  deleteUser: async (userId: string): Promise<any> => {
    return fetchAPI(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
};