'use client';

import { cn } from "@/lib/utils"
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
import { useRouter } from "next/navigation";
import { SetStateAction, useState } from "react";
import { FieldError } from "./ui/field";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login: authLogin } = useAuth(); // Get the global login function
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: { token: string }) => {
      authLogin(data.token); // Store token and update auth state
      // No explicit router.push here, as authLogin handles redirection
    }, 
    onError: (error: { message: SetStateAction<string> }) => {
      setFormError(error.message);
      console.error("Login failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!emailOrUsername || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    loginMutation.mutate({ emailOrUsername, password });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email or username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {formError && (
                <Field>
                  <FieldError>{formError}</FieldError>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="emailOrUsername">Email or Username</FieldLabel>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="m@example.com or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
                {/* <Button variant="outline" type="button"> */}
                  {/* Login with Google */}
                {/* </Button> */}
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/request-access" className="underline">
                    Request access
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
