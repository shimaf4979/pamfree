// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Cloudinaryモジュールをクライアントサイドでインポートしないようにする
  webpack: (config: any, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;