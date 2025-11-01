"use client";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { generateOptimizedImageUrl } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

const ProfileAvatarEditor = dynamic(() => import("./profile-avatar-editor").then(mod => mod.ProfileAvatarEditor), {
  ssr: false,
});

type ProfileAvatarProps = {
  name: string;
  email: string;
  username: string;
  isOwner: boolean;
  profilePic: {
    key: string;
    width?: number | null;
    height?: number | null;
  } | null;
};

export function ProfileAvatar({ name, email, username, profilePic, isOwner }: ProfileAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(
    `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(name || email || "user")}&flip=true`
  );

  useEffect(() => {
    let isActive = true;
    const getUrl = async () => {
      if (profilePic?.key) {
        const url = await generateOptimizedImageUrl(profilePic.key, { width: 160, height: 160, format: 'webp', quality: 80 });
        if (isActive) {
          setAvatarUrl(url);
        }
      } else {
        const diceBearUrl = `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(name || email || "user")}&flip=true`;
        if (isActive) {
          setAvatarUrl(diceBearUrl);
        }
      }
    };
    getUrl();
    return () => { isActive = false; };
  }, [profilePic, name, email]);
  
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

  const isDiceBearAvatar = !profilePic?.key;

  return (
    <div className="relative -mt-24 md:-mt-28">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <Avatar className="size-32 md:size-40 border-2 border-white bg-white shadow-xl">
              <Image
                src={avatarUrl}
                alt={`${name}'s avatar`}
                width={160}
                height={160}
                className="rounded-full object-cover"
                unoptimized={isDiceBearAvatar}
                priority
              />
              <AvatarFallback className="text-2xl">{getInitials(name, email)}</AvatarFallback>
            </Avatar>
            {isOwner && (
              <Suspense fallback={null}>
                <ProfileAvatarEditor profilePic={profilePic} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
