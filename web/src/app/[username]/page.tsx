"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const router = useRouter();
  const { username: urlUsername } = useParams(); // Get username from URL
  const { user: authUser, isLoggedIn, isLoading: authLoading } = useAuth(); // Get auth state

  // Convert urlUsername to string, as useParams can return string | string[]
  const profileUsername = Array.isArray(urlUsername) ? urlUsername[0] : urlUsername;

  // Determine if the logged-in user is the owner of this profile
  const isOwner = isLoggedIn && authUser?.username === profileUsername;

  // Fetch public profile data if not the owner or not logged in
  const { 
    data: publicProfile, 
    isLoading: publicProfileLoading, 
    isError: publicProfileError,
    error: publicProfileQueryError
  } = trpc.user.getByUsername.useQuery(
    { username: profileUsername as string },
    {
      enabled: !isOwner && !authLoading && !!profileUsername, // Only fetch if not owner, auth state known, and username exists
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1, // Retry once
    }
  );

  const isLoading = authLoading || publicProfileLoading;

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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  // Handle case where user is not logged in and public profile is not found/error
  if (!isOwner && publicProfileError) {
    console.error("Error loading public profile:", publicProfileQueryError);
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">Profile Not Found</h1>
        <p className="mt-2 text-muted-foreground">The user &quot;{profileUsername}&quot; does not exist or their profile could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  const profileData = isOwner ? authUser : publicProfile;

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
            <p className="mb-2 text-primary-foreground/80">This is your private profile view.</p>
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
            {isLoggedIn && (
              <Button asChild className="mt-6">
                <Link href={`mailto:${profileData.email}`}>Contact {profileData.name}</Link>
              </Button>
            )}
            {!isLoggedIn && (
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
