"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Folder, User } from "lucide-react";
import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";

export function SiteHeader() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();

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

  const isDiceBearAvatar = !user?.artist?.profilePic?.key;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="inline-block font-bold">Medical Artists</span>
        </Link>
        <nav className="flex items-center space-x-6">
          {isLoading ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 cursor-pointer">
                  <Avatar className="size-9">
                    <OptimizedAvatarImage
                      imageKey={user?.artist?.profilePic?.key}
                      alt="User Avatar"
                      seed={user?.name || user?.email || 'user'}
                      unoptimized={isDiceBearAvatar}
                    />
                    <AvatarFallback>{getInitials(user?.name, user?.email)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-background" aria-label="Online status"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <Link 
                    href={`/${user?.artist?.slug}`} 
                    className="flex flex-col space-y-1 hover:bg-accent hover:text-accent-foreground rounded-sm p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium leading-none">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email}
                    </p>
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={`/${user?.artist?.slug}`} className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      <span>View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/project-briefs" className="cursor-pointer">
                      <Folder className="mr-2 size-4" />
                      <span>Project Briefs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
