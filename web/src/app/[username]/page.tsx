// This is now a Server Component
import { notFound } from "next/navigation";
import { serverTrpc } from "@/lib/server-trpc"; // Import the server-side tRPC client
import { UserProfileClient } from "./user-profile-client"; // Import the new client component

// Re-define the type for AuthenticatedUser to match api/src/procedures/auth.ts and use-auth.tsx
// This ensures type consistency when passing data from server to client component.
type AuthenticatedUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: Date;
};

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username: profileUsername } = await params;

  if (!profileUsername) {
    // This case should ideally not happen with Next.js dynamic routes,
    // but good for type safety.
    notFound();
  }

  // Fetch public profile data on the server using the server-side tRPC client
  const publicProfile: AuthenticatedUser | null = await serverTrpc.user.getByUsername.query({
    username: profileUsername,
  });

  // If the public profile doesn't exist, render Next.js's 404 page
  if (!publicProfile) {
    notFound();
  }

  // Pass the fetched public profile data to the client component.
  // The client component will then handle client-side auth (via useAuth)
  // and render the appropriate private/public view.
  return (
    <UserProfileClient 
      publicProfile={publicProfile} 
      profileUsername={profileUsername} 
    />
  );
}
