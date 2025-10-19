import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getArtworkImageUrl(artworkId: string): string {
  // Use a consistent, mockable image URL for now.
  // In a real app, this would come from your CDN/R2 storage.
  return `https://picsum.photos/600/450?random=${artworkId}`;
}
