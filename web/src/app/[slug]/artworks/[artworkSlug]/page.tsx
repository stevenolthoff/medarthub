import { notFound } from "next/navigation";
import { serverTrpc, type RouterOutputs } from "@/lib/server-trpc";
import { ArtworkDetailViewServer } from "../../components/artwork-detail-view-server";
import Link from "next/link";
import { Metadata } from "next";
import { generateOptimizedClientUrl } from "@/lib/utils";
import { ArtworkStructuredData } from "@/components/structured-data";

// Define types for params
interface ArtworkPageParams {
  slug: string; // artist-slug
  artworkSlug: string;
}

interface ArtworkPageProps {
  params: Promise<ArtworkPageParams>;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const { slug: artistSlug, artworkSlug } = await params;

  // Fetch artist and artworks to get details for metadata
  const artistProfile = await serverTrpc.artist.getBySlug.query({ slug: artistSlug });

  if (!artistProfile) {
    return {
      title: "Artwork Not Found",
      description: "The requested artwork could not be found.",
    };
  }

  // Filter artworks to find the specific one by artworkSlug
  const artwork = artistProfile.artworks.find(a => a.slug === artworkSlug);

  if (!artwork) {
    return {
      title: "Artwork Not Found",
      description: "The requested artwork could not be found.",
    };
  }

  const ogImageUrl = artwork.coverImage?.key
    ? await generateOptimizedClientUrl(artwork.coverImage.key, {
        width: 1200,
        height: 630,
        format: 'jpeg',
        quality: 80,
      })
    : undefined;

  return {
    title: `${artwork.title} by ${artistProfile.user.name} - Medical Artists`,
    description: artwork.description || `View ${artwork.title} by ${artistProfile.user.name} on Medical Artists.`,
    openGraph: {
      title: `${artwork.title} by ${artistProfile.user.name}`,
      description: artwork.description || `View ${artwork.title} by ${artistProfile.user.name} on Medical Artists.`,
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          alt: artwork.title,
        },
      ] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${artwork.title} by ${artistProfile.user.name}`,
      description: artwork.description || `View ${artwork.title} by ${artistProfile.user.name} on Medical Artists.`,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    alternates: {
      canonical: `/${artistSlug}/artworks/${artworkSlug}`,
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug: artistSlug, artworkSlug } = await params;

  if (!artistSlug || !artworkSlug) {
    notFound();
  }

  // Fetch artist and all associated PUBLISHED artworks for public view,
  // or all artworks if the current user is the owner (which serverTrpc handles).
  const artistProfile = await serverTrpc.artist.getBySlug.query({ slug: artistSlug });

  if (!artistProfile) {
    notFound();
  }

  const currentArtworkIndex = artistProfile.artworks.findIndex(a => a.slug === artworkSlug);
  const currentArtwork = artistProfile.artworks[currentArtworkIndex];

  if (!currentArtwork) {
    notFound();
  }

  return (
    <>
      <ArtworkStructuredData 
        artwork={currentArtwork}
        artist={artistProfile}
        baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'https://Medical Artists.com'}
      />
      <div className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="w-full max-w-screen-xl flex-1 flex flex-col pt-4">
          <div className="px-4 pb-4 border-b">
            <h1 className="text-2xl font-bold text-foreground">
              {currentArtwork.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Artwork by <Link href={`/${artistSlug}`} className="hover:underline">@{artistProfile.user.username}</Link>
            </p>
          </div>
          <ArtworkDetailViewServer
            artwork={currentArtwork}
            allArtworks={artistProfile.artworks}
            currentArtworkIndex={currentArtworkIndex}
            artistSlug={artistSlug}
            artistName={artistProfile.user.name}
          />
        </div>
      </div>
    </>
  );
}
