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
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Effect to set the initial artwork when modal opens
  useEffect(() => {
    if (isOpen && initialArtworkId) {
      const initialIndex = artworks.findIndex((a) => a.id === initialArtworkId);
      if (initialIndex !== -1) {
        setCurrentIndex(initialIndex);
      } else {
        // Fallback if initialArtworkId is not found, default to first or close
        setCurrentIndex(0); 
        if (artworks.length === 0) {
          onClose();
        }
      }
    }
  }, [isOpen, initialArtworkId, artworks, onClose]);

  // Handle internal lightbox navigation (no URL changes in lightbox mode)
  const handleNavigateArtwork = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
  }, []);

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
