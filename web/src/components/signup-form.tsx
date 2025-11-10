'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import { FieldError } from "./ui/field";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [generalError, setGeneralError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const codeFromQuery = searchParams.get("code");
    if (codeFromQuery) {
      setInviteCode(codeFromQuery.toUpperCase());
    }
  }, [searchParams]);

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: () => {
      router.push("/login?signupSuccess=true"); // Redirect to login on success
    },
    onError: (error: { message: SetStateAction<string> }) => {
      setGeneralError(error.message);
      console.error("Signup failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    if (!username || !name || !email || !password || !confirmPassword || !inviteCode) {
      setGeneralError(!inviteCode ? "An invite code is required." : "Please fill in all required fields");
      return;
    }

    if (username.length < 3) {
      setGeneralError("Username must be at least 3 characters long");
      return;
    }

    if (username.length > 20) {
      setGeneralError("Username must be at most 20 characters long");
      return;
    }

    // Check if username contains only alphanumeric characters, hyphens, and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setGeneralError("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    if (password !== confirmPassword) {
      setGeneralError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setGeneralError("Password must be at least 8 characters long");
      return;
    }

    signupMutation.mutate({ username, name, email, password, confirmPassword, inviteCode });
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {generalError && (
              <Field>
                <FieldError>{generalError}</FieldError>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="inviteCode">Invite Code</FieldLabel>
              <Input
                id="inviteCode"
                type="text"
                placeholder="Received in your approval email"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                readOnly={!!searchParams.get("code")}
                aria-describedby="invite-code-description"
              />
              <FieldDescription id="invite-code-description">
                This code is required to create an account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input 
                id="username" 
                type="text" 
                placeholder="johndoe" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
              <FieldDescription>
                3-20 characters, letters, numbers, hyphens, and underscores only. Must be unique.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
                {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
