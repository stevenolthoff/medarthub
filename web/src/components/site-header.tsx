"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { LogOut, Menu, Settings, User, X } from "lucide-react";
import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { Dialog, DialogPanel } from "@headlessui/react";

export function SiteHeader() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsMenuOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      hoverTimeoutRef.current = null;
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
        <nav className="flex items-center">
          {isLoading ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : (
            <>
              <div className="hidden items-center gap-3 lg:flex">
                {isLoggedIn ? (
                  <div
                    onMouseEnter={handleOpen}
                    onMouseLeave={handleClose}
                    className="-mx-4 -my-3 rounded-full px-4 py-3 cursor-pointer"
                  >
                <DropdownMenu
                  open={isMenuOpen}
                  onOpenChange={setIsMenuOpen}
                  modal={false}
                >
                  <DropdownMenuTrigger
                    asChild
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <Link
                      href={user?.artist?.slug ? `/${user.artist.slug}` : "/settings"}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full p-0 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Open account menu"
                    >
                      <Avatar className="size-9">
                        <OptimizedAvatarImage
                          imageKey={user?.artist?.profilePic?.key}
                          alt="User Avatar"
                          seed={user?.name || user?.email || "user"}
                          unoptimized={isDiceBearAvatar}
                        />
                            <AvatarFallback>
                              {getInitials(user?.name, user?.email)}
                            </AvatarFallback>
                      </Avatar>
                      <span
                        className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-background"
                        aria-label="Online status"
                      ></span>
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="end"
                    forceMount
                    onMouseEnter={handleOpen}
                    onMouseLeave={handleClose}
                    sideOffset={8}
                  >
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
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 size-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="mr-2 size-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/request-access">Request Access</Link>
                </Button>
              </div>
                )}
              </div>

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open main menu"
                  className="cursor-pointer"
                >
                  <Menu className="size-6" />
                </Button>
                <Dialog
                  open={isMobileMenuOpen}
                  onClose={setMobileMenuOpen}
                  className="relative z-50 lg:hidden"
                >
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                  <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-background p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2"
                      >
                        <span className="inline-block font-bold">Medical Artists</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                        className="cursor-pointer"
                      >
                        <X className="size-6" />
                      </Button>
                    </div>
                    <div className="mt-6 flow-root">
                      <div className="-my-6 divide-y divide-border">
                        {isLoggedIn && user ? (
                          <div className="space-y-4 py-6">
                            <Link
                              href={`/${user.artist?.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-4 rounded-md px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                            >
                              <Avatar className="size-12">
                                <OptimizedAvatarImage
                                  imageKey={user.artist?.profilePic?.key}
                                  alt="User Avatar"
                                  seed={user.name || user.email || "user"}
                                  unoptimized={isDiceBearAvatar}
                                />
                                <AvatarFallback className="text-xl">
                                  {getInitials(user.name, user.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col space-y-1">
                                <p className="text-base font-medium leading-none">
                                  {user.name || user.email}
                                </p>
                                <p className="text-muted-foreground text-sm leading-none">
                                  {user.email}
                                </p>
                              </div>
                            </Link>
                            <nav className="flex flex-col space-y-1">
                              <Link
                                href={`/${user.artist?.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                              >
                                <User className="size-5" />
                                View Profile
                              </Link>
                              <Link
                                href="/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                              >
                                <Settings className="size-5" />
                                Settings
                              </Link>
                            </nav>
                          </div>
                        ) : (
                          <div className="space-y-2 py-6">
                            <Button asChild className="w-full text-base">
                              <Link href="/request-access" onClick={() => setMobileMenuOpen(false)}>
                                Request Access
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full text-base"
                            >
                              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                Login
                              </Link>
                            </Button>
                          </div>
                        )}
                        {isLoggedIn && (
                          <div className="py-6">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full justify-start gap-3 px-3 py-2 text-base font-medium text-destructive focus:text-destructive"
                            >
                              <LogOut className="size-5" />
                              Sign Out
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogPanel>
                </Dialog>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
