import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

export async function generateOptimizedImageUrl(
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
