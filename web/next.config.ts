import type { NextConfig } from "next";

const imgproxyHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_IMGPROXY_URL || 'http://localhost').hostname;
  } catch {
    return 'localhost';
  }
})();

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT || 'http://localhost';
const r2PublicHostname = (() => {
  try {
    return new URL(r2PublicUrl).hostname;
  } catch {
    return 'localhost';
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: r2PublicUrl.startsWith('https') ? 'https' : 'http',
        hostname: r2PublicHostname,
        port: '',
        pathname: '/**',
      },
      {
        protocol: (process.env.NEXT_PUBLIC_IMGPROXY_URL || '').startsWith('https') ? 'https' : 'http',
        hostname: imgproxyHostname,
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    NEXT_PUBLIC_R2_PUBLIC_ENDPOINT: process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT,
    NEXT_PUBLIC_IMGPROXY_URL: process.env.NEXT_PUBLIC_IMGPROXY_URL,
  },
};

export default nextConfig;
