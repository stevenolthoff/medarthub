"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { type RouterOutputs } from "@/lib/server-trpc";
import { ArtworkDetailView } from "./artwork-detail-view";
import { useRouter, usePathname } from "next/navigation";

type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

interface ArtworkLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  initialArtworkId: string | null;
  artistSlug: string;
}

export function ArtworkLightbox({
  isOpen,
  onClose,
  artworks,
  initialArtworkId,
  artistSlug,
}: ArtworkLightboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Effect to set the initial artwork and update URL when modal opens
  useEffect(() => {
    if (isOpen && initialArtworkId) {
      const initialIndex = artworks.findIndex((a) => a.id === initialArtworkId);
      const artwork = artworks[initialIndex];
      if (initialIndex !== -1 && artwork) {
        setCurrentIndex(initialIndex);
        const targetUrl = `/${artistSlug}/artworks/${artwork.slug}`;
        // Push the new URL to history, allowing back button to close lightbox
        if (pathname !== targetUrl) {
          router.push(targetUrl, { scroll: false });
        }
      } else {
        // Fallback if initialArtworkId is not found, default to first or close
        setCurrentIndex(0); 
        if (artworks.length > 0) {
          const targetUrl = `/${artistSlug}/artworks/${artworks[0].slug}`;
          if (pathname !== targetUrl) {
            router.push(targetUrl, { scroll: false });
          }
        } else {
          onClose();
        }
      }
    } else if (!isOpen && pathname.includes('/artworks/')) {
      // If closing modal and current URL is an artwork page, go back to artist profile
      router.back();
    }
  }, [isOpen, initialArtworkId, artworks, artistSlug, router, pathname, onClose]);

  // Handle internal lightbox navigation and update URL via router.replace
  const handleNavigateArtwork = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    const newArtwork = artworks[newIndex];
    if (newArtwork) {
      const newUrl = `/${artistSlug}/artworks/${newArtwork.slug}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [artworks, artistSlug, router]);

  const currentArtwork = artworks[currentIndex];

  if (!currentArtwork) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold flex-1 text-left line-clamp-1">
            {currentArtwork.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Close lightbox">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <ArtworkDetailView
          artwork={currentArtwork}
          allArtworks={artworks}
          currentArtworkIndex={currentIndex}
          artistSlug={artistSlug}
          isStandalonePage={false}
          onNavigateArtwork={handleNavigateArtwork}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}