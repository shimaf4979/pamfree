import axios from 'axios';

// API基本設定
const API_BASE_URL = 'https://api.pamfree.com/api';

// Axiosインスタンスの作成
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターでトークンを設定
apiClient.interceptors.request.use(
  async (config) => {
    // ブラウザ環境のみで実行
    if (typeof window !== 'undefined') {
      // セッションの取得方法に応じてトークンを取得（例：localStorageから）
      // 注: Next.jsのセッション機能を使用しているため実際には不要な場合が多い
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // エラーログを出力
    console.error('API Error:', error.response?.data || error.message);
    
    // 認証エラー（401）の場合
    if (error.response?.status === 401) {
      // 必要に応じてログイン画面にリダイレクト
      console.log('Authentication error, redirecting to login...');
    }
    
    return Promise.reject(error);
  }
);

// APIのエンドポイント型定義
export interface ApiEndpoints {
  // 認証関連
  'auth/register': { path: '/auth/register', method: 'POST' };
  'auth/login': { path: '/auth/login', method: 'POST' };
  
  // マップ関連
  'maps': { path: '/maps', method: 'GET' | 'POST' };
  'maps/id': { path: string, method: 'GET' | 'PATCH' | 'DELETE' };
  'maps/floors': { path: string, method: 'GET' | 'POST' };
  
  // フロア関連
  'floors': { path: string, method: 'GET' | 'PATCH' | 'DELETE' };
  'floors/image': { path: string, method: 'POST' };
  'floors/pins': { path: string, method: 'GET' | 'POST' };
  
  // ピン関連
  'pins': { path: string, method: 'GET' | 'PATCH' | 'DELETE' };
  
  // 公開編集関連
  'public-edit/register': { path: '/public-edit/register', method: 'POST' };
  'public-edit/verify': { path: '/public-edit/verify', method: 'POST' };
  'public-edit/pins': { path: '/public-edit/pins', method: 'POST' };
  'public-edit/pins/id': { path: string, method: 'PATCH' | 'DELETE' };
  
  // ビューワー関連
  'viewer': { path: string, method: 'GET' };
  
  // アカウント関連
  'account/update-profile': { path: '/account/update-profile', method: 'PATCH' };
  'account/change-password': { path: '/account/change-password', method: 'POST' };
  
  // 管理者関連
  'admin/users': { path: '/admin/users', method: 'GET' };
  'admin/users/id': { path: string, method: 'PATCH' | 'DELETE' };
}

// 汎用APIリクエスト関数
export async function apiRequest<T = any, P = any>(
  endpoint: string,
  method: string,
  data?: P,
  headers?: Record<string, string>,
  params?: Record<string, string>
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method,
      data,
      headers,
      params,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

// パス生成ヘルパー関数
export const apiPaths = {
  // マップ関連
  mapById: (id: string) => `/maps/${id}`,
  mapFloors: (mapId: string) => `/maps/${mapId}/floors`,
  
  // フロア関連
  floorById: (id: string) => `/floors/${id}`,
  floorImage: (id: string) => `/floors/${id}/image`,
  floorPins: (id: string) => `/floors/${id}/pins`,
  
  // ピン関連
  pinById: (id: string) => `/pins/${id}`,
  
  // 公開編集関連
  publicEditPin: (id: string) => `/public-edit/pins/${id}`,
  
  // ビューワー関連
  viewerById: (id: string) => `/viewer/${id}`,
  
  // 管理者関連
  adminUserById: (id: string) => `/admin/users/${id}`
};