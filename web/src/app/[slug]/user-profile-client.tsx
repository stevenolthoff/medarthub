// web/src/app/[slug]/user-profile-client.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "./components/hero-banner";
import { ProfileAvatar } from "./components/profile-avatar";
import { UserInfoColumn } from "./components/user-info-column";
import { MainContentColumn } from "./components/main-content-column";
import { type RouterOutputs } from "@/lib/server-trpc";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Use tRPC inferred types instead of manually defining them
type Artist = NonNullable<RouterOutputs['artist']['getBySlug']>;

// Extended type to include pre-generated URLs from server
type ArtistWithUrls = Artist & {
  profilePicUrl: string;
  bannerImageUrl: string | null;
  artworks: Array<Artist['artworks'][0] & { coverImageUrl: string }>;
};

interface UserProfileClientProps {
  artistProfile: ArtistWithUrls; // Artist profile data with pre-generated URLs
  profileSlug: string; // Artist slug from the URL
}

export function UserProfileClient({ artistProfile, profileSlug }: UserProfileClientProps) {
  // Fetch client-side auth state
  const { user: authUser, isLoggedIn, isLoading: authLoading } = useAuth();

  // Determine if the logged-in user is the owner of this artist profile
  const isOwner = isLoggedIn && authUser?.id === artistProfile.user.id;

  // The `artistProfile` is guaranteed to exist here because the Server Component
  // calls `notFound()` if it's null. We use the artist's user data if it's the owner,
  // otherwise, we fall back to the `artistProfile.user` data.
  const profileData = isOwner ? authUser : artistProfile.user;

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Absolutely positioned loader overlay */}
      {authLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span>Loading user session...</span>
          </div>
        </div>
      )}

      {/* Main content with fade-in transition */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-opacity duration-300",
          authLoading ? "opacity-0" : "opacity-100"
        )}
      >
        {!profileData ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold text-destructive">Artist Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The artist profile for &quot;{profileSlug}&quot; could not be found.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        ) : (
          <>
            <HeroBanner
              bannerImage={artistProfile.bannerImage}
              bannerImageUrl={artistProfile.bannerImageUrl}
              isOwner={isOwner}
            />

            <ProfileAvatar
              name={profileData.name}
              email={profileData.email}
              username={profileData.username}
              profilePicUrl={artistProfile.profilePicUrl}
              profilePic={artistProfile.profilePic}
              isOwner={isOwner}
            />

            {/* Main content area */}
            <div className="w-full px-4 md:px-6 lg:px-8 mt-8 pb-32">
              <div className="flex flex-col lg:flex-row gap-8">
                <UserInfoColumn
                  name={profileData.name}
                  email={profileData.email}
                  username={profileData.username}
                  createdAt={profileData.createdAt}
                  headline={artistProfile.headline}
                  company={artistProfile.company}
                  location={artistProfile.location}
                  websiteUrl={artistProfile.websiteUrl}
                  isOwner={isOwner}
                  isLoggedIn={isLoggedIn}
                />

                <MainContentColumn
                  isOwner={isOwner}
                  isLoggedIn={isLoggedIn}
                  artistSlug={profileSlug}
                  artistName={profileData.name}
                  about={artistProfile.about}
                  initialArtworks={artistProfile.artworks}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
