import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Link as LinkIcon, CalendarDays } from "lucide-react";

type UserInfoColumnProps = {
  name: string;
  email: string;
  username: string;
  createdAt: Date;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  isOwner: boolean;
  isLoggedIn: boolean;
};

export function UserInfoColumn({ 
  name, 
  email, 
  username, 
  createdAt, 
  headline,
  company,
  location,
  websiteUrl,
  isOwner, 
  isLoggedIn 
}: UserInfoColumnProps) {
  return (
    <div className="w-full lg:w-1/6 flex flex-col items-center lg:items-start">
      {/* User Name */}
      <h1 className="text-3xl md:text-4xl font-bold text-center lg:text-left mb-1 break-words">{name}</h1>
      {headline && <p className="text-lg text-muted-foreground text-center lg:text-left mb-4">{headline}</p>}
      
      {/* Professional Details */}
      <div className="w-full space-y-2 mb-6">
        {company && (
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Briefcase className="size-4 text-muted-foreground flex-shrink-0" />
            <span>{company}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-3 text-sm text-foreground">
            <MapPin className="size-4 text-muted-foreground flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
        {websiteUrl && (
          <div className="flex items-center gap-3 text-sm text-foreground">
            <LinkIcon className="size-4 text-muted-foreground flex-shrink-0" />
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
              {websiteUrl.replace(/^(https?:\/\/)?(www\.)?/, '')}
            </a>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-foreground">
          <CalendarDays className="size-4 text-muted-foreground flex-shrink-0" />
          <span>Joined {new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 mb-6">
        {isOwner ? (
          <Button className="w-full" asChild>
            <Link href="/settings">Edit Your Profile</Link>
          </Button>
        ) : (
          <>
            {isLoggedIn ? (
              <Button className="w-full" asChild>
                <Link href={`mailto:${email}`}>Contact</Link>
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
      <div className="w-full text-sm text-foreground">
        <p className="mb-2">Email: {email}</p>
        <p>Username: @{username}</p>
      </div>
    </div>
  );
}
