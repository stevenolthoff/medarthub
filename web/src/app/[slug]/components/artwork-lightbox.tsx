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
import { ChevronLeft, ChevronRight, X, Link, Check } from "lucide-react";
import { type RouterOutputs } from "@/lib/server-trpc";
import { generateOptimizedClientUrl } from "@/lib/utils";

type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0]; // Now includes coverImage

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
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentOptimizedImageUrl, setCurrentOptimizedImageUrl] = useState<string | null>(null);

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

  const currentArtwork = artworks[currentIndex];

  // Update optimized image URL when current artwork changes
  useEffect(() => {
    async function loadOptimized() {
      if (currentArtwork?.coverImage?.key) {
        const url = await generateOptimizedClientUrl(currentArtwork.coverImage.key, {
          width: currentArtwork.coverImage.width || 1920,
          height: currentArtwork.coverImage.height || 1080,
          format: 'webp',
          quality: 90,
        });
        setCurrentOptimizedImageUrl(url);
      } else {
        setCurrentOptimizedImageUrl('/placeholder-artwork.svg');
      }
    }
    if (currentArtwork) {
      loadOptimized();
    } else {
      setCurrentOptimizedImageUrl(null);
    }
  }, [currentArtwork]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
  }, [artworks.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? artworks.length - 1 : prevIndex - 1
    );
  }, [artworks.length]);

  // Permalink functionality
  const handleCopyPermalink = useCallback(async () => {
    if (!currentArtwork) return;
    
    const fullUrl = `${window.location.origin}/${artistSlug}/artworks/${currentArtwork.slug}`;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      console.log('Permalink copied to clipboard:', fullUrl);
      
      // Show copied feedback
      setLinkCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy permalink:', err);
    }
  }, [currentArtwork, artistSlug]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!currentArtwork) return null;

  const isFirstArtwork = currentIndex === 0;
  const isLastArtwork = currentIndex === artworks.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <DialogContent className="fixed inset-0 z-50 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            Artwork Lightbox - {currentArtwork.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
          <div className="relative flex h-full w-full max-w-screen-lg flex-col">
            <div
              className="relative flex w-full flex-shrink-0 items-center justify-center p-4"
              style={{ height: "65%" }}
            >
              {currentOptimizedImageUrl && (
                <Image
                  src={currentOptimizedImageUrl}
                  alt={currentArtwork.title}
                  width={currentArtwork.coverImage?.width || 1920}
                  height={currentArtwork.coverImage?.height || 1080}
                  className="max-h-full max-w-full object-contain"
                  priority
                />
              )}
              {artworks.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    onClick={handlePrev}
                    disabled={isFirstArtwork}
                    aria-label="Previous artwork"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    onClick={handleNext}
                    disabled={isLastArtwork}
                    aria-label="Next artwork"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            <div
              className="w-full overflow-y-auto bg-[#212121] text-white"
              style={{ height: "35%" }}
            >
              <div className="mx-auto max-w-3xl p-4 md:p-6">
                <h1 className="text-xl font-bold md:text-2xl">
                  {currentArtwork.title}
                </h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
                  <span>
                    Created: {new Date(currentArtwork.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPermalink}
                    className={`-ml-2 text-neutral-400 transition-colors hover:bg-neutral-700/50 hover:text-white ${
                      linkCopied ? "text-green-400" : ""
                    }`}
                  >
                    {linkCopied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Link className="mr-2 h-4 w-4" />
                    )}
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
                <div className="mt-4 border-t border-neutral-700/50 pt-4">
                  <p className="whitespace-pre-wrap text-base text-neutral-200">
                    {currentArtwork.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
