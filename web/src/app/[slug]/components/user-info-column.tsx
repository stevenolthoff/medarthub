"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Link as LinkIcon, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

type UserInfoColumnProps = {
  name: string;
  email: string;
  username: string;
  createdAt: Date;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  about?: string | null;
  isOwner: boolean;
  isLoggedIn: boolean;
};

const MAX_LENGTH = 150;

export function UserInfoColumn({ 
  name, 
  email, 
  username, 
  createdAt, 
  headline,
  company,
  location,
  websiteUrl,
  about,
  isOwner, 
  isLoggedIn 
}: UserInfoColumnProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = about && about.length > MAX_LENGTH;
  const displayText = shouldTruncate && !isExpanded 
    ? `${about.substring(0, MAX_LENGTH)}...` 
    : about;

  return (
    <div className="w-full lg:w-1/6 flex flex-col items-center lg:items-start">
      {/* User Name */}
      <h1 className="text-3xl md:text-4xl font-bold text-center lg:text-left mb-1 break-words">{name}</h1>
      {headline && <p className="text-lg text-muted-foreground text-center lg:text-left mb-4">{headline}</p>}
      
      {/* About Me Section */}
      {about && (
        <div className="w-full mb-6">
          <h2 className="text-sm uppercase text-muted-foreground mb-2">ABOUT ME</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {displayText}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-foreground hover:underline cursor-pointer"
            >
              {isExpanded ? (
                <>
                  Read Less
                  <ChevronUp className="size-4" />
                </>
              ) : (
                <>
                  Read More
                  <ChevronDown className="size-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}
      
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
