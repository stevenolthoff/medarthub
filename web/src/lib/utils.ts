import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getArtworkImageUrl(imageKey: string | undefined | null): string {
  // If no image key is provided, use a generic placeholder
  if (!imageKey) {
    return "/placeholder-artwork.svg"; // This file should exist in `web/public/`
  }
  
  // This constructs a URL that simulates R2 storage but uses picsum.photos for dynamic images.
  // In a production Next.js application, `imageKey` would be used with `next/image`'s loader
  // configuration, or an API route (e.g., `/api/images/[key]`) to securely fetch and optimize
  // images from your R2 bucket.
  
  // Extract a unique identifier from the R2 key to use with picsum.photos.
  // Example R2 key format: `users/<userId>/images/<imageId>/original.png`
  const parts = imageKey.split('/');
  const imageIdPart = parts.length >= 4 ? parts[3] : undefined; // The UUID part of the image key

  if (imageIdPart) {
    // For local development and demonstration, use picsum.photos with the imageId part
    // This allows unique images per artwork based on their stored R2 key/ID.
    return `https://picsum.photos/600/450?random=${imageIdPart}`;
  }
  
  // Fallback if the key format is unexpected, use a generic random image from picsum
  return `https://picsum.photos/600/450?random=default-artwork`;
}
