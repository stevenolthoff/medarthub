import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ProfileAvatarProps = {
  name: string;
  email: string;
  username: string;
};

export function ProfileAvatar({ name, email, username }: ProfileAvatarProps) {
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

  return (
    <div className="relative -mt-24 md:-mt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-center md:justify-start">
          <Avatar className="size-32 md:size-40 border-2 border-white bg-white shadow-xl">
            <Image
              src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(name || email || "user")}&flip=true`}
              alt="User Avatar"
              width={160}
              height={160}
              className="rounded-full"
              unoptimized
            />
            <AvatarFallback className="text-2xl">{getInitials(name, email)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
