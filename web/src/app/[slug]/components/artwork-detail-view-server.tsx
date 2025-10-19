import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type RouterOutputs } from "@/lib/server-trpc";
import { getArtworkImageUrl } from "@/lib/utils";

type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

interface ArtworkDetailViewServerProps {
  artwork: Artwork;
  allArtworks: Artwork[];
  currentArtworkIndex: number;
  artistSlug: string;
  artistName: string;
}

export function ArtworkDetailViewServer({
  artwork,
  allArtworks,
  currentArtworkIndex,
  artistSlug,
  artistName,
}: ArtworkDetailViewServerProps) {
  const isFirstArtwork = currentArtworkIndex === 0;
  const isLastArtwork = currentArtworkIndex === allArtworks.length - 1;
  const artworkImageUrl = getArtworkImageUrl(artwork.id);
  
  const prevArtwork = isFirstArtwork ? allArtworks[allArtworks.length - 1] : allArtworks[currentArtworkIndex - 1];
  const nextArtwork = isLastArtwork ? allArtworks[0] : allArtworks[currentArtworkIndex + 1];

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-background max-h-svh w-full mb-32">
      {/* Image Section */}
      <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[300px] md:min-h-full">
        {artworkImageUrl && (
          <Image
            src={artworkImageUrl}
            alt={`${artwork.title} by ${artistName} - Digital artwork on MedArtHub`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
            className="object-contain"
            unoptimized
            priority
          />
        )}
        
        {/* Navigation Buttons */}
        {allArtworks.length > 1 && (
          <>
            <Button
              asChild
              variant="ghost"
              size="icon-lg"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full size-10"
              disabled={isFirstArtwork}
              aria-label="Previous artwork"
            >
              <Link href={`/${artistSlug}/artworks/${prevArtwork.slug}`}>
                <ChevronLeft className="h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon-lg"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full size-10"
              disabled={isLastArtwork}
              aria-label="Next artwork"
            >
              <Link href={`/${artistSlug}/artworks/${nextArtwork.slug}`}>
                <ChevronRight className="h-6 w-6" />
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Details Section */}
      <div className="md:w-1/3 p-4 border-t md:border-t-0 md:border-l overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">{artwork.title}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {artwork.description || "No description provided."}
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Created: {new Date(artwork.createdAt).toLocaleDateString()}</p>
          <p>Status: {artwork.status}</p>
        </div>
        
        {/* Navigation Links */}
        {allArtworks.length > 1 && (
          <div className="mt-6 flex gap-2">
            {!isFirstArtwork && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/${artistSlug}/artworks/${prevArtwork.slug}`}>
                  ← Previous
                </Link>
              </Button>
            )}
            {!isLastArtwork && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/${artistSlug}/artworks/${nextArtwork.slug}`}>
                  Next →
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
