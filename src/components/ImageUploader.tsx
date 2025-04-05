// components/ImageUploader.tsx
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  floorId: string;
  onUploadComplete: (file: File) => Promise<void>;
  onUploadError: (message: string) => void;
  currentImageUrl?: string | null;
  buttonText?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  floorId,
  onUploadComplete,
  onUploadError,
  currentImageUrl = null,
  buttonText = "画像をアップロード",
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // 画像ファイルかどうかの確認
    if (!file.type.startsWith('image/')) {
      onUploadError('画像ファイルを選択してください');
      return;
    }
    
    // アップロード処理の開始
    setIsUploading(true);
    
    try {
      // 親コンポーネントのアップロードハンドラを呼び出す
      await onUploadComplete(file);
      
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      onUploadError(error instanceof Error ? error.message : '画像のアップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        title="画像をアップロード"
        placeholder="画像をアップロード"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {isUploading ? (
        <div className="px-3 py-1 bg-gray-400 text-white rounded text-sm">
          アップロード中...
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            currentImageUrl 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {currentImageUrl ? '画像変更' : buttonText}
        </button>
      )}
    </div>
  );
};

export default ImageUploader;