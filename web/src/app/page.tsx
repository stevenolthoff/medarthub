import { serverTrpc } from "@/lib/server-trpc";
import { ArtistCard } from "@/components/artist-card";
import { generateOptimizedServerUrl, generateOptimizedClientUrl } from "@/lib/utils";
import { Metadata } from "next";
import { HomeStructuredData } from "@/components/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const artists = await serverTrpc.artist.list.query();
  // Note: artist.list only returns artists with published artworks, so all artworks are published
  const publishedArtworks = artists.flatMap(artist => artist.artworks);
  const totalArtists = artists.length;
  const totalArtworks = publishedArtworks.length;

  // Get featured artwork for OG image if available
  const featuredArtwork = publishedArtworks.find(artwork => artwork.coverImage?.key);
  const ogImageUrl = featuredArtwork?.coverImage?.key
    ? await generateOptimizedClientUrl(featuredArtwork.coverImage.key, {
        width: 1200,
        height: 630,
        format: 'jpeg',
        quality: 80,
      })
    : undefined;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://medicalartists.co';
  
  return {
    title: "Medical Artists - Discover Amazing Medical & Scientific Art",
    description: `Explore ${totalArtworks > 0 ? `${totalArtworks} ${totalArtworks === 1 ? 'artwork' : 'artworks'} from ${totalArtists} ${totalArtists === 1 ? 'artist' : 'talented artists'}` : 'portfolios from talented creators'} in the medical and scientific fields. Discover digital art, illustrations, and creative works from medical artists worldwide.`,
    keywords: ["medical art", "scientific illustration", "medical illustration", "digital art", "art portfolio", "medical artists", "healthcare art", "biomedical art"],
    openGraph: {
      title: "Medical Artists - Discover Amazing Medical & Scientific Art",
      description: `Explore ${totalArtworks > 0 ? `${totalArtworks} ${totalArtworks === 1 ? 'artwork' : 'artworks'} from ${totalArtists} ${totalArtists === 1 ? 'artist' : 'talented artists'}` : 'portfolios from talented creators'} in the medical and scientific fields.`,
      type: "website",
      url: baseUrl,
      siteName: "Medical Artists",
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          alt: featuredArtwork?.title || "Medical Artists Homepage",
          width: 1200,
          height: 630,
        },
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "Medical Artists - Discover Amazing Medical & Scientific Art",
      description: `Explore ${totalArtworks > 0 ? `${totalArtworks} ${totalArtworks === 1 ? 'artwork' : 'artworks'} from ${totalArtists} ${totalArtists === 1 ? 'artist' : 'talented artists'}` : 'portfolios from talented creators'} in the medical and scientific fields.`,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default async function Home() {
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://medicalartists.com';

  return (
    <>
      <HomeStructuredData artists={artists} baseUrl={baseUrl} />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Discover Amazing Artists
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore portfolios from talented creators in the medical and scientific fields.
        </p>
      </header>
      
      {artists.length > 0 ? (
        <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artistsWithImageUrls.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </main>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border h-96">
            <h2 className="text-2xl font-semibold text-foreground">No Artists Yet</h2>
            <p className="mt-2 text-muted-foreground">
                Looks like our gallery is waiting for its first star. Sign up to be the first!
            </p>
        </div>
      )}
      </div>
    </>
  );
}
