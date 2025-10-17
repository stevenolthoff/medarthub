// web/src/app/[username]/user-profile-client.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "./components/hero-banner";
import { ProfileAvatar } from "./components/profile-avatar";
import { UserInfoColumn } from "./components/user-info-column";
import { MainContentColumn } from "./components/main-content-column";

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
      <HeroBanner />
      
      <ProfileAvatar 
        name={profileData.name}
        email={profileData.email}
        username={profileData.username}
      />
      
      {/* Main content area */}
      <div className="w-full px-4 md:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <UserInfoColumn
            name={profileData.name}
            email={profileData.email}
            username={profileData.username}
            createdAt={profileData.createdAt}
            isOwner={isOwner}
            isLoggedIn={isLoggedIn}
          />
          
          <MainContentColumn
            isOwner={isOwner}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}
