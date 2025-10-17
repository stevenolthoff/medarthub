// web/src/app/[username]/user-profile-client.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Keep useRouter for client-side navigation
import { useAuth } from "@/hooks/use-auth"; // Client-side hook
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Type definition should match what is passed from the Server Component
type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  createdAt: Date;
};

interface UserProfileClientProps {
  publicProfile: AuthenticatedUser; // Profile data fetched on the server
  profileUsername: string; // Username from the URL
}

export function UserProfileClient({ publicProfile, profileUsername }: UserProfileClientProps) {
  const router = useRouter();
  // Fetch client-side auth state
  const { user: authUser, isLoggedIn, isLoading: authLoading } = useAuth();

  // Determine if the logged-in user is the owner of this profile
  const isOwner = isLoggedIn && authUser?.username === profileUsername;

  // Helper to get initials for avatar
  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0]?.toUpperCase() || email?.[0]?.toUpperCase() || "NN";
    }
    return email?.[0]?.toUpperCase() || "NN";
  };

  // Show a loading state specifically for the client-side authentication check
  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-lg text-muted-foreground">Loading user session...</p>
      </div>
    );
  }

  // The `publicProfile` is guaranteed to exist here because the Server Component
  // calls `notFound()` if it's null. We use `authUser` if it's the owner,
  // otherwise, we fall back to the `publicProfile` data.
  const profileData = isOwner ? authUser : publicProfile;

  // This fallback should ideally not be hit if the Server Component logic is correct,
  // but serves as a safeguard.
  if (!profileData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">User Not Found</h1>
        <p className="mt-2 text-muted-foreground">The profile for &quot;{profileUsername}&quot; could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Banner - 20% of screen height */}
      <div className="h-[20vh] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
        {/* Customizable background pattern or image can go here */}
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Decorative elements for visual appeal */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">@{profileData.username}</h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 drop-shadow-md">{profileData.name}</p>
          {isOwner && (
            <p className="text-xs sm:text-sm mt-2 opacity-75 drop-shadow-sm">Your customizable hero banner</p>
          )}
        </div>
      </div>
      
      {/* Profile Avatar - positioned to overlap banner */}
      <div className="relative -mt-24 md:-mt-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center md:justify-start">
            <Avatar className="size-32 md:size-40 border-2 border-white bg-white shadow-xl">
              <Image
                src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(profileData.name || profileData.email || "user")}&flip=true`}
                alt="User Avatar"
                width={160}
                height={160}
                className="rounded-full"
                unoptimized
              />
              <AvatarFallback className="text-2xl">{getInitials(profileData.name, profileData.email)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-lg mt-8">

        {isOwner ? (
          <div className="mt-6">
            <p className="mb-2 text-foreground">This is your private profile view.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Email: <span className="font-medium">{profileData.email}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Joined: <span className="font-medium">{new Date(profileData.createdAt).toLocaleDateString()}</span>
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild>
                <Link href="/settings">Edit Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/project-briefs">View Your Projects</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="mb-2 text-muted-foreground">This is a public profile view.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Joined: <span className="font-medium">{new Date(profileData.createdAt).toLocaleDateString()}</span>
            </p>
            {isLoggedIn && ( // Only show contact button if logged in
              <Button asChild className="mt-6">
                <Link href={`mailto:${profileData.email}`}>Contact {profileData.name}</Link>
              </Button>
            )}
            {!isLoggedIn && ( // Suggest login if not logged in
              <p className="mt-4 text-sm text-muted-foreground">
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">Log in</Link> to interact.
              </p>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
