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
import { generateOptimizedImageUrl } from "@/lib/utils";

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
        const url = await generateOptimizedImageUrl(currentArtwork.coverImage.key, {
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
        <DialogOverlay className="bg-transparent" />
        <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 m-0 rounded-none border-0 bg-transparent">
          <DialogTitle className="sr-only">Artwork Lightbox - {currentArtwork.title}</DialogTitle>
          {/* Full-screen artwork with overlay */}
          <div className="relative w-full h-full bg-transparent">
          {/* Full-screen artwork */}
          {currentOptimizedImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={currentOptimizedImageUrl}
                alt={currentArtwork.title}
                width={currentArtwork.coverImage?.width || 1920}
                height={currentArtwork.coverImage?.height || 1080}
                className="object-contain max-h-full"
                priority
              />
            </div>
          )}
          
          {/* Top overlay with title and close button */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6">
            {/* Mobile layout: X button top right, content below */}
            <div className="md:hidden">
              <div className="flex justify-end mb-4">
                <DialogClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white" 
                    aria-label="Close lightbox"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DialogClose>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-2">
                  {currentArtwork.title}
                </h1>
                <p className="text-sm text-white/80 mb-4">
                  {currentArtwork.description || "No description provided."}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPermalink}
                  className={`h-12 w-12 rounded-full text-white transition-all duration-200 ${
                    linkCopied 
                      ? 'bg-green-500/70 hover:bg-green-600/80' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  aria-label={linkCopied ? "Link copied!" : "Copy permalink"}
                >
                  {linkCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Link className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Desktop layout: side by side */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {currentArtwork.title}
                </h1>
                <p className="text-sm md:text-base text-white/80 mb-3">
                  {currentArtwork.description || "No description provided."}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPermalink}
                  className={`h-8 w-8 rounded-full text-white transition-all duration-200 ${
                    linkCopied 
                      ? 'bg-green-500/70 hover:bg-green-600/80' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  aria-label={linkCopied ? "Link copied!" : "Copy permalink"}
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </Button>
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
