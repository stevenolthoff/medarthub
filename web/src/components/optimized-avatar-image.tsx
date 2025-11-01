"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { generateOptimizedImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface OptimizedAvatarImageProps {
  imageKey: string | null | undefined;
  alt: string;
  seed: string;
  className?: string;
  unoptimized?: boolean;
}

export function OptimizedAvatarImage({ imageKey, alt, seed, className, unoptimized = false }: OptimizedAvatarImageProps) {
  const [imageUrl, setImageUrl] = useState<string>(
    `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(seed)}&flip=true`
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoaded(false);

    async function getUrl() {
      if (imageKey) {
        const url = await generateOptimizedImageUrl(imageKey, { width: 160, height: 160, format: 'webp', quality: 80 });
        if (isActive) {
          setImageUrl(url);
        }
      } else {
        const diceBearUrl = `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(seed)}&flip=true`;
        if (isActive) {
          setImageUrl(diceBearUrl);
          setIsLoaded(true);
        }
      }
    }
    
    getUrl();
    
    return () => { isActive = false; };
  }, [imageKey, seed]);

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes="160px"
      className={cn(
        "rounded-full object-cover transition-opacity duration-300",
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      unoptimized={unoptimized || !imageKey}
    />
  );
}
