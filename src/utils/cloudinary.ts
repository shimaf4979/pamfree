// utils/cloudinary.ts

/**
 * 画像をCloudinaryにアップロードする
 * @param file アップロードするファイル
 * @param folder 保存先フォルダ
 * @returns アップロードされた画像のURL
 */
export const uploadImage = async (file: File, folder: string = 'floors'): Promise<string> => {
  try {
    // ファイルをBase64に変換
    const base64Data = await convertFileToBase64(file);
    console.log("送信します");
    
    // Cloudinaryにアップロード（API Routeを使用）
    const uploadResponse = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: base64Data,
        folder,
        transformation: {
          quality: 'auto',
          fetch_format: 'webp',
        },
      }),
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.message || '画像のアップロードに失敗しました');
    }
    
    const result = await uploadResponse.json();
    return result.url;
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    throw error;
  }
};

/**
 * 画像をCloudinaryから削除する
 * @param publicId 削除する画像のパブリックID
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '画像の削除に失敗しました');
    }
  } catch (error) {
    console.error('画像削除エラー:', error);
    throw error;
  }
};

/**
 * ファイルをBase64に変換する
 * @param file 変換するファイル
 * @returns Base64エンコードされた文字列
 */
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * CloudinaryのURLからpublicIdを抽出する
 * @param url CloudinaryのURL
 * @returns publicId
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // URLからファイル名を抽出
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const fileNameWithExt = pathParts[pathParts.length - 1];
    
    // 拡張子を除去
    const fileName = fileNameWithExt.split('.')[0];
    
    // フォルダパスを含めたpublicIdを構築
    const folderPath = pathParts.slice(pathParts.length - 2, pathParts.length - 1).join('/');
    return folderPath ? `${folderPath}/${fileName}` : fileName;
  } catch (error) {
    console.error('PublicID抽出エラー:', error);
    return null;
  }
};