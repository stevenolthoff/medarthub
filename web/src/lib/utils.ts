import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getArtworkImageUrl(imageKey: string | undefined | null): string {
  // If no image key is provided, use a generic placeholder
  if (!imageKey) {
    console.log('getArtworkImageUrl: No image key provided, using placeholder');
    return "/placeholder-artwork.svg"; // This file should exist in `web/public/`
  }
  
  console.log('getArtworkImageUrl: Processing image key:', imageKey);
  
  // Use actual R2 public endpoint and bucket name
  const r2PublicEndpoint = process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT;

  if (r2PublicEndpoint) {
    // Construct the direct public URL for the R2 object
    const url = `${r2PublicEndpoint}/${imageKey}`;
    console.log('getArtworkImageUrl: Generated R2 public URL:', url);
    return url;
  }
  
  // Fallback to picsum for development if R2 public endpoint/bucket is not configured
  // This helps to still see *some* image if R2 public access is not fully set up.
  const parts = imageKey.split('/');
  const imageIdPart = parts.length >= 4 ? parts[3] : undefined; // The UUID part of the image key
  if (imageIdPart) {
    const fallbackUrl = `https://picsum.photos/600/450?random=${imageIdPart}`;
    console.log('getArtworkImageUrl: R2 public endpoint not configured, using picsum fallback:', fallbackUrl);
    return fallbackUrl;
  }

  const genericFallbackUrl = `https://picsum.photos/600/450?random=default-artwork`;
  console.log('getArtworkImageUrl: Using generic picsum fallback URL:', genericFallbackUrl);
  return genericFallbackUrl;
}
