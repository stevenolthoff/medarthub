// This is now a Server Component
import { notFound } from "next/navigation";
import { serverTrpc, type RouterOutputs } from "@/lib/server-trpc"; // Import the server-side tRPC client and types
import { UserProfileClient } from "./user-profile-client"; // Import the new client component

// Use tRPC inferred types instead of manually defining them
type Artist = NonNullable<RouterOutputs['user']['getBySlug']>;

interface ArtistProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArtistProfilePage({ params }: ArtistProfilePageProps) {
  const { slug: profileSlug } = await params;

  if (!profileSlug) {
    // This case should ideally not happen with Next.js dynamic routes,
    // but good for type safety.
    notFound();
  }

  // Fetch public artist profile data on the server using the server-side tRPC client
  const artistProfile: Artist | null = await serverTrpc.user.getBySlug.query({
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
    <UserProfileClient 
      artistProfile={artistProfile} 
      profileSlug={profileSlug} 
    />
  );
}
