// app/api/cloudinary/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinaryの設定
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'publicIdが必要です' },
        { status: 400 }
      );
    }
    
    // Cloudinaryから画像を削除（サーバーサイドのみ）
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    return NextResponse.json({
      message: '画像が正常に削除されました',
      result
    });
  } catch (error) {
    console.error('Cloudinary削除エラー:', error);
    return NextResponse.json(
      { error: '画像の削除に失敗しました' },
      { status: 500 }
    );
  }
}