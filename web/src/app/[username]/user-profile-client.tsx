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
    <div className="container mx-auto flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-lg">
        <Avatar className="mx-auto size-24">
          <Image
            src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(profileData.name || profileData.email || "user")}&flip=true`}
            alt="User Avatar"
            width={96}
            height={96}
            className="rounded-full"
            unoptimized
          />
          <AvatarFallback>{getInitials(profileData.name, profileData.email)}</AvatarFallback>
        </Avatar>

        <h1 className="mt-4 text-3xl font-bold">@{profileData.username}</h1>
        <p className="text-muted-foreground text-lg">{profileData.name}</p>

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
  );
}
