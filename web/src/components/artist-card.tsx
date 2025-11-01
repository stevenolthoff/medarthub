"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type RouterOutputs } from '@/lib/server-trpc';
import { ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type ArtworkWithUrl = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  coverImage: {
    width: number | null;
    height: number | null;
  } | null;
};

type ArtistForCard = {
  id: string;
  slug: string;
  user: { name: string };
  profilePicUrl: string;
  artworks: ArtworkWithUrl[];
};

function ArtworkImage({ artwork }: { artwork: ArtworkWithUrl }) {
  return (
    <Image
      src={artwork.coverImageUrl}
      alt={artwork.title}
      fill
      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      priority
    />
  );
}

function ArtistAvatar({ artist, artwork }: { artist: ArtistForCard; artwork: ArtworkWithUrl }) {
  const isDiceBearAvatar = artist.profilePicUrl.includes('dicebear.com');

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Avatar className="size-10 border">
            <Image
              src={artist.profilePicUrl}
              alt={`${artist.user.name}'s avatar`}
              width={40}
              height={40}
              className="rounded-full object-cover"
              unoptimized={isDiceBearAvatar}
            />
            <AvatarFallback>{artist.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate font-semibold leading-tight">{artwork.title}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {artist.user.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ArtistCard({ artist }: { artist: ArtistForCard }) {
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

      <ArtistAvatar artist={artist} artwork={currentArtwork} />
    </Link>
  );
}
