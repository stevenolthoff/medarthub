"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type RouterOutputs } from "@/lib/server-trpc";

type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

interface ArtworkLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: (Artwork & { imageUrl: string })[]; // Artworks with generated image URLs
  initialArtworkId: string | null;
}

export function ArtworkLightbox({
  isOpen,
  onClose,
  artworks,
  initialArtworkId,
}: ArtworkLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Effect to set the initial artwork when the modal opens or initialArtworkId changes
  useEffect(() => {
    if (isOpen && initialArtworkId) {
      const initialIndex = artworks.findIndex((a) => a.id === initialArtworkId);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    } else if (!isOpen) {
      setCurrentIndex(-1); // Reset when closed
    }
  }, [isOpen, initialArtworkId, artworks]);

  const currentArtwork = artworks[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
  }, [artworks.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? artworks.length - 1 : prevIndex - 1
    );
  }, [artworks.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleNext, handlePrev]);

  if (!currentArtwork) return null;

  const isFirstArtwork = currentIndex === 0;
  const isLastArtwork = currentIndex === artworks.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-transparent" />
        <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 m-0 rounded-none border-0 bg-transparent">
          <DialogTitle className="sr-only">Artwork Lightbox - {currentArtwork.title}</DialogTitle>
          {/* Full-screen artwork with overlay */}
          <div className="relative w-full h-full bg-transparent">
          {/* Full-screen artwork */}
          <Image
            src={currentArtwork.imageUrl}
            alt={currentArtwork.title}
            fill
            sizes="100vw"
            className="object-contain"
            unoptimized
            priority
          />
          
          {/* Top overlay with title and close button */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {currentArtwork.title}
                </h1>
                <p className="text-sm md:text-base text-white/80">
                  {currentArtwork.description || "No description provided."}
                </p>
              </div>
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white ml-4" 
                  aria-label="Close lightbox"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Navigation Buttons */}
          {artworks.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                onClick={handlePrev}
                disabled={isFirstArtwork}
                aria-label="Previous artwork"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                onClick={handleNext}
                disabled={isLastArtwork}
                aria-label="Next artwork"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Bottom overlay with additional info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white/80 text-sm">
              <p>Created: {new Date(currentArtwork.createdAt).toLocaleDateString()}</p>
              <p>Status: {currentArtwork.status}</p>
            </div>
          </div>
        </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
