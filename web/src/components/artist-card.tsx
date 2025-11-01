"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type RouterOutputs } from '@/lib/server-trpc';
import { generateOptimizedImageUrl } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type ArtistWithArtworks = RouterOutputs['artist']['list'][0];

function ArtworkImage({ artwork }: { artwork: ArtistWithArtworks['artworks'][0] }) {
  const [imageUrl, setImageUrl] = useState('/placeholder-artwork.svg');

  useEffect(() => {
    let isActive = true;
    async function getUrl() {
      if (artwork.coverImage?.key) {
        const url = await generateOptimizedImageUrl(artwork.coverImage.key, {
          width: 800,
          height: 600,
          format: 'webp',
          quality: 75,
        });
        if (isActive) setImageUrl(url);
      }
    }
    getUrl();
    return () => { isActive = false; };
  }, [artwork.coverImage]);

  return (
    <Image
      src={imageUrl}
      alt={artwork.title}
      fill
      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      priority={imageUrl !== '/placeholder-artwork.svg'}
    />
  );
}

export function ArtistCard({ artist }: { artist: ArtistWithArtworks }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === artist.artworks.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? artist.artworks.length - 1 : prev));
  };

  const currentArtwork = useMemo(() => artist.artworks[currentIndex], [artist.artworks, currentIndex]);

  if (!currentArtwork) return null;

  return (
    <Link
      href={`/${artist.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      aria-label={`View ${artist.user.name}'s profile`}
    >
      <div className="block aspect-[4/3] overflow-hidden relative">
        <ArtworkImage artwork={currentArtwork} />
      </div>
      
      {artist.artworks.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60 focus:opacity-100 cursor-pointer z-10"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60 focus:opacity-100 cursor-pointer z-10"
            aria-label="Next artwork"
          >
            <ChevronRight className="size-5" />
          </Button>
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 z-10">
            {artist.artworks.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'size-6 text-white/50 transition-colors cursor-pointer',
                  currentIndex === index && 'text-white'
                )}
                aria-label={`Go to artwork ${index + 1}`}
              >
                <Dot
                  className="size-full"
                  strokeWidth={4}
                />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar className="size-10 border">
              <Image
                src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(artist.user.name)}`}
                alt={`${artist.user.name}'s avatar`}
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
              <AvatarFallback>{artist.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate font-semibold leading-tight">{currentArtwork.title}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {artist.user.name}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
