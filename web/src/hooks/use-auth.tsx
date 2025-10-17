"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import Cookies from "js-cookie";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
// Define the user type based on what auth.me returns
type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use trpc.auth.me query to fetch user data
  const { data, isLoading: queryLoading, refetch, isError, error } = trpc.auth.me.useQuery(undefined, {
    enabled: !!Cookies.get('auth-token'), // Only fetch if a token exists
    staleTime: Infinity, // Keep data fresh unless manually refetched
    refetchOnWindowFocus: false, // Prevent refetching on window focus
    retry: false, // Do not retry on error for auth, just show logged out state
  });

  useEffect(() => {
    setIsLoading(queryLoading);
    if (!queryLoading) {
      if (data) {
        setUser(data);
      } else if (isError) {
        console.error("Failed to fetch user:", error?.message);
        setUser(null);
        Cookies.remove('auth-token'); // Clear token if it's invalid
      }
    }
  }, [data, queryLoading, isError, error]);

  const login = useCallback(async (token: string) => {
    Cookies.set('auth-token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' }); // Store token for 7 days
    await refetch(); // Refetch user data immediately after login
    router.push('/'); // Redirect to home after login
  }, [refetch, router]);

  const logout = useCallback(() => {
    Cookies.remove('auth-token');
    setUser(null);
    // Invalidate all tRPC queries by refetching
    refetch();
    router.push('/login'); // Redirect to login after logout
  }, [router, refetch]);

  const isLoggedIn = !!user;

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
