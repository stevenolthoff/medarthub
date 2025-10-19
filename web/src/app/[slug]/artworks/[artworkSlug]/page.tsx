import { notFound } from "next/navigation";
import { serverTrpc, type RouterOutputs } from "@/lib/server-trpc";
import { ArtworkDetailView } from "../../components/artwork-detail-view";
import Link from "next/link";
import { Metadata } from "next";
import { getArtworkImageUrl } from "@/lib/utils";

// Define types for params
interface ArtworkPageParams {
  slug: string; // artist-slug
  artworkSlug: string;
}

interface ArtworkPageProps {
  params: ArtworkPageParams;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const { slug: artistSlug, artworkSlug } = params;

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

  return {
    title: `${artwork.title} by ${artistProfile.user.name} - MedArtHub`,
    description: artwork.description || `View ${artwork.title} by ${artistProfile.user.name} on MedArtHub.`,
    openGraph: {
      title: `${artwork.title} by ${artistProfile.user.name}`,
      description: artwork.description || `View ${artwork.title} by ${artistProfile.user.name} on MedArtHub.`,
      images: [
        {
          url: getArtworkImageUrl(artwork.id),
          alt: artwork.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${artwork.title} by ${artistProfile.user.name}`,
      description: artwork.description || `View ${artwork.title} by ${artistProfile.user.name} on MedArtHub.`,
      images: [getArtworkImageUrl(artwork.id)],
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug: artistSlug, artworkSlug } = params;

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

  // No-op for a standalone page as navigation is handled by router.push directly
  // from ArtworkDetailView, not by an internal state change
  const handleNavigateArtworkPage = (newIndex: number) => {
    // This function will be called by ArtworkDetailView when next/prev is clicked
    // but the actual navigation is done within ArtworkDetailView using router.push
    // when isStandalonePage is true. So this function itself doesn't need to do anything.
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background">
      <div className="w-full max-w-screen-xl flex-1 flex flex-col pt-4">
        <div className="px-4 pb-4 border-b">
          <h1 className="text-2xl font-bold text-foreground">
            {currentArtwork.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Artwork by <Link href={`/${artistProfile.user.username}`} className="hover:underline">@{artistProfile.user.username}</Link>
          </p>
        </div>
        <ArtworkDetailView
          artwork={currentArtwork}
          allArtworks={artistProfile.artworks}
          currentArtworkIndex={currentArtworkIndex}
          artistSlug={artistSlug}
          isStandalonePage={true}
          onNavigateArtwork={handleNavigateArtworkPage}
        />
      </div>
    </div>
  );
}
