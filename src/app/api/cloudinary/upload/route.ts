// app/api/cloudinary/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinaryの設定
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  console.log("POSTリクエストが受け取られました");
  try {
    // リクエストから画像データとオプションを取得
    const { data, folder, transformation } = await request.json();
    
    if (!data) {
      return NextResponse.json(
        { error: '画像データが必要です' },
        { status: 400 }
      );
    }
    
    // アップロードオプションを設定
    const uploadOptions: any = {
      folder: folder || 'pamfree',
      resource_type: 'auto',
    };
    
    // 変換設定があれば追加
    if (transformation) {
      uploadOptions.transformation = transformation;
    }
    
    // Cloudinaryにアップロード（サーバーサイドのみ）
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(data, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinaryアップロードエラー:', error);
    return NextResponse.json(
      { error: '画像アップロードに失敗しました' },
      { status: 500 }
    );
  }
}