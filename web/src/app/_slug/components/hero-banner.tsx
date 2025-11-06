"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Pencil } from 'lucide-react';
import type { RouterOutputs } from '@/lib/server-trpc';

type BannerImage = NonNullable<RouterOutputs['artist']['getBySlug']>['bannerImage'];

const BannerImageEditor = dynamic(() => 
  import("./banner-image-editor").then(mod => mod.BannerImageEditor), 
  { ssr: false }
);

interface HeroBannerProps {
  bannerImage: BannerImage;
  bannerImageUrl: string | null;
  isOwner: boolean;
}

export function HeroBanner({ bannerImage, bannerImageUrl, isOwner }: HeroBannerProps) {
  const [isLoaded, setIsLoaded] = useState(!bannerImageUrl);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleBannerClick = () => {
    if (isOwner) {
      setEditorOpen(true);
    }
  };

  return (
    <>
      <div 
        onClick={handleBannerClick}
        className={cn(
          "h-[25vh] md:h-[30vh] w-full bg-muted/50 relative group",
          isOwner && "cursor-pointer"
        )}
      >
        {bannerImageUrl ? (
          <Image
            src={bannerImageUrl}
            alt="User profile banner"
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setIsLoaded(true)}
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          </div>
        )}
        {isOwner && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-md">
              <Pencil className="size-4" />
              <span className="text-sm font-medium">Edit Banner</span>
            </div>
          </div>
        )}
      </div>
      {isOwner && (
        <Suspense fallback={null}>
          <BannerImageEditor bannerImage={bannerImage} isOpen={editorOpen} onOpenChange={setEditorOpen} />
        </Suspense>
      )}
    </>
  );
}
