import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ArtworkImageInfo {
  id: string;
  key: string;
  filename: string;
  contentType: string;
  width?: number | null;
  height?: number | null;
}

export function getArtworkImageR2Key(imageInfo: ArtworkImageInfo | undefined | null): string | null {
  return imageInfo?.key || null;
}

export function getArtworkImageUrl(imageKey: string | null | undefined): string {
  if (!imageKey) {
    return "/placeholder-artwork.svg";
  }
  
  const r2PublicEndpoint = process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT;
  if (r2PublicEndpoint) {
    const prefix = r2PublicEndpoint.replace(/\/$/, '');
    return `${prefix}/${imageKey}`;
  }
  
  return "/placeholder-artwork.svg";
}

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

function toUrlSafeBase64(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateOptimizedServerUrl(
  r2Key: string,
  options: ImageOptimizationOptions = {}
): string {
  const IMGPROXY_KEY = process.env.IMGPROXY_KEY;
  const IMGPROXY_SALT = process.env.IMGPROXY_SALT;
  const IMGPROXY_URL = process.env.NEXT_PUBLIC_IMGPROXY_URL;
  const R2_PUBLIC_ENDPOINT = process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT;

  if (!IMGPROXY_URL || !IMGPROXY_KEY || !IMGPROXY_SALT || !R2_PUBLIC_ENDPOINT) {
    return `${(R2_PUBLIC_ENDPOINT || '').replace(/\/$/, '')}/${r2Key}`;
  }

  const keyBuffer = Buffer.from(IMGPROXY_KEY, 'hex');
  const saltBuffer = Buffer.from(IMGPROXY_SALT, 'hex');

  const resizeOption = options.width && options.height
    ? `rs:fit:${options.width}:${options.height}`
    : options.width ? `w:${options.width}`
    : options.height ? `h:${options.height}`
    : '';
  const qualityOption = options.quality ? `q:${options.quality}` : '';
  const formatOption = options.format ? `f:${options.format}` : '';
  
  const processingOptions = [resizeOption, qualityOption, formatOption].filter(Boolean).join('/');
  
  const r2SourceUrl = `${R2_PUBLIC_ENDPOINT.replace(/\/$/, '')}/${r2Key}`;
  const encodedSourceUrl = toUrlSafeBase64(Buffer.from(r2SourceUrl));
  
  const path = `/${processingOptions}/plain/${encodedSourceUrl}`;

  const hmac = crypto.createHmac('sha256', keyBuffer);
  hmac.update(saltBuffer);
  hmac.update(path);
  const signature = toUrlSafeBase64(hmac.digest());

  return `${IMGPROXY_URL}/${signature}${path}`;
}

export async function generateOptimizedClientUrl(
  imageKey: string | null | undefined,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  if (!imageKey) {
    return "/placeholder-artwork.svg";
  }

  const searchParams = new URLSearchParams();
  searchParams.set('key', imageKey);
  if (options.width) searchParams.set('w', options.width.toString());
  if (options.height) searchParams.set('h', options.height.toString());
  if (options.quality) searchParams.set('q', options.quality.toString());
  if (options.format) searchParams.set('f', options.format);

  try {
    const response = await fetch(`/api/imgproxy?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch optimized image URL.');
    }
    const data = await response.json();
    return data.url;
  } catch (error) {
    const r2PublicEndpoint = process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT;
    if (r2PublicEndpoint) {
      // Endpoint points directly to the bucket; never append bucket name
      const prefix = r2PublicEndpoint.replace(/\/$/, '');
      return `${prefix}/${imageKey}`;
    }
    return "/placeholder-artwork.svg";
  }
}
