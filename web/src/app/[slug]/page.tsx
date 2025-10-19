// This is now a Server Component
import { notFound } from "next/navigation";
import { serverTrpc, type RouterOutputs } from "@/lib/server-trpc"; // Import the server-side tRPC client and types
import { UserProfileClient } from "./user-profile-client"; // Import the new client component
import { Metadata } from "next";
import { ArtistStructuredData } from "@/components/structured-data";
import { getArtworkImageUrl } from "@/lib/utils";

// Use tRPC inferred types instead of manually defining them
type Artist = NonNullable<RouterOutputs['artist']['getBySlug']>;

interface ArtistProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: ArtistProfilePageProps): Promise<Metadata> {
  const { slug: profileSlug } = await params;

  if (!profileSlug) {
    return {
      title: "Artist Profile Not Found - MedArtHub",
      description: "The requested artist profile could not be found.",
    };
  }

  // Fetch artist profile data for metadata
  const artistProfile: Artist | null = await serverTrpc.artist.getBySlug.query({
    slug: profileSlug,
  });

  if (!artistProfile) {
    return {
      title: "Artist Profile Not Found - MedArtHub",
      description: "The requested artist profile could not be found.",
    };
  }

  const publishedArtworks = artistProfile.artworks.filter(artwork => artwork.status === 'PUBLISHED');
  const artworkCount = publishedArtworks.length;
  
  return {
    title: `${artistProfile.user.name} (@${artistProfile.user.username}) - MedArtHub`,
    description: `View ${artistProfile.user.name}'s art portfolio on MedArtHub. ${artworkCount} ${artworkCount === 1 ? 'artwork' : 'artworks'} available. Discover digital art, illustrations, and creative works.`,
    openGraph: {
      title: `${artistProfile.user.name} (@${artistProfile.user.username})`,
      description: `View ${artistProfile.user.name}'s art portfolio on MedArtHub. ${artworkCount} ${artworkCount === 1 ? 'artwork' : 'artworks'} available.`,
      type: "profile",
      images: publishedArtworks.length > 0 && publishedArtworks[0].coverImage?.key ? [ // Use coverImage.key
        {
          url: getArtworkImageUrl(publishedArtworks[0].coverImage.key), // Use coverImage.key
          alt: `${publishedArtworks[0].title} by ${artistProfile.user.name}`,
        },
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${artistProfile.user.name} (@${artistProfile.user.username})`,
      description: `View ${artistProfile.user.name}'s art portfolio on MedArtHub. ${artworkCount} ${artworkCount === 1 ? 'artwork' : 'artworks'} available.`,
      images: publishedArtworks.length > 0 && publishedArtworks[0].coverImage?.key ? [getArtworkImageUrl(publishedArtworks[0].coverImage.key)] : undefined, // Use coverImage.key
    },
    alternates: {
      canonical: `/${profileSlug}`,
    },
  };
}

export default async function ArtistProfilePage({ params }: ArtistProfilePageProps) {
  const { slug: profileSlug } = await params;

  if (!profileSlug) {
    // This case should ideally not happen with Next.js dynamic routes,
    // but good for type safety.
    notFound();
  }

  // Fetch public artist profile data on the server using the server-side tRPC client
  const artistProfile: Artist | null = await serverTrpc.artist.getBySlug.query({
    slug: profileSlug,
  });

  // If the artist profile doesn't exist, render Next.js's 404 page
  if (!artistProfile) {
    notFound();
  }

  // Pass the fetched artist profile data to the client component.
  // The client component will then handle client-side auth (via useAuth)
  // and render the appropriate private/public view.
  return (
    <>
      <ArtistStructuredData 
        artist={artistProfile} 
        baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'https://medarthub.com'} 
      />
      <UserProfileClient 
        artistProfile={artistProfile} 
        profileSlug={profileSlug} 
      />
    </>
  );
}
