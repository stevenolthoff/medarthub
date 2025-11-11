import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { serverTrpc } from "@/lib/server-trpc";
import { ArtistCard } from "@/components/artist-card";
import { generateOptimizedServerUrl } from "@/lib/utils";
import { HomeStructuredData } from "@/components/structured-data";
import { Button } from "@/components/ui/button";

export async function HomeGallery() {
  const artists = await serverTrpc.artist.list.query();

  const artistsWithImageUrls = artists.map(artist => ({
    ...artist,
    artworks: artist.artworks.map(artwork => ({
      ...artwork,
      coverImageUrl: artwork.coverImage?.key 
        ? generateOptimizedServerUrl(artwork.coverImage.key, { width: 800, height: 600, format: 'webp', quality: 75 })
        : '/placeholder-artwork.svg'
    })),
    profilePicUrl: artist.profilePic?.key
      ? generateOptimizedServerUrl(artist.profilePic.key, { width: 40, height: 40, format: 'webp', quality: 80 })
      : `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(artist.user.name)}&flip=true`
  }));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://medicalartists.co";

  return (
    <>
      <HomeStructuredData artists={artists} baseUrl={baseUrl} />
      <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" className="w-full cursor-not-allowed sm:w-auto" disabled>
          Popular
        </Button>
        <div className="hidden items-center gap-1 rounded-full border border-border bg-muted/40 p-1 md:flex">
          {["Animation", "Branding", "Illustration", "Web Design"].map(tag => (
            <Button
              key={tag}
              variant="ghost"
              size="sm"
              className="cursor-not-allowed rounded-full"
              disabled
            >
              {tag}
            </Button>
          ))}
        </div>
        <Button variant="outline" className="w-full cursor-not-allowed sm:w-auto" disabled>
          <SlidersHorizontal className="mr-2 size-4" />
          Filters
        </Button>
      </div>
      {artists.length > 0 ? (
        <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artistsWithImageUrls.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </main>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/30">
          <div className="pointer-events-none grid grid-cols-1 gap-4 p-4 opacity-70 blur-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-gradient-to-br from-muted to-muted/60"
              />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 px-6 py-10 text-center backdrop-blur">
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pre-launch preview
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-foreground sm:text-4xl">
              Our Gallery Is Coming To Life
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              We&apos;re inviting pioneering medical illustrators to shape the first wave.
              Reserve your spot and be featured the moment we launch.
            </p>
            <Button asChild size="lg" className="mt-6 cursor-pointer rounded-full">
              <Link href="/request-access">Request Early Access</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

