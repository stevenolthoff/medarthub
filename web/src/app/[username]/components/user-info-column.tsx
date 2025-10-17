import Link from "next/link";
import { Button } from "@/components/ui/button";

type UserInfoColumnProps = {
  name: string;
  email: string;
  username: string;
  createdAt: Date;
  isOwner: boolean;
  isLoggedIn: boolean;
};

export function UserInfoColumn({ 
  name, 
  email, 
  username, 
  createdAt, 
  isOwner, 
  isLoggedIn 
}: UserInfoColumnProps) {
  return (
    <div className="w-full lg:w-1/6 flex flex-col items-center lg:items-start">
      {/* User Name */}
      <h1 className="text-3xl md:text-4xl font-bold text-center lg:text-left mb-4">{name}</h1>
      
      {/* Professional Details */}
      <div className="w-full space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
          <span>Available for Freelance</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
          <span>Creative Professional</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
          <span>MedArtHub Member</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
          <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 mb-6">
        {isOwner ? (
          <>
            <Button className="w-full" asChild>
              <Link href="/settings">Edit Profile</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/project-briefs">View Your Projects</Link>
            </Button>
          </>
        ) : (
          <>
            {isLoggedIn ? (
              <Button className="w-full" asChild>
                <Link href={`mailto:${email}`}>Contact {name}</Link>
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/login">Log in to Contact</Link>
              </Button>
            )}
          </>
        )}
      </div>

      {/* Additional Info */}
      <div className="w-full text-sm text-muted-foreground">
        <p className="mb-2">Email: {email}</p>
        <p>Username: @{username}</p>
      </div>
    </div>
  );
}
