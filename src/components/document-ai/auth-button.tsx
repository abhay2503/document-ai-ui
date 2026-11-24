"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { isAuthenticated, isLoading, email, signIn, signUp, signOut } = useAuth();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        …
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => signIn()}>
          Log In
        </Button>
        <Button size="sm" onClick={() => signUp()}>
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Avatar: first letter of the user's email; full email on hover. */}
      <span
        className="bg-brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white uppercase shadow-md shadow-primary/25 select-none"
        title={email}
        aria-label={`Signed in as ${email}`}
      >
        {email.charAt(0) || "?"}
      </span>
      <Button variant="outline" size="sm" onClick={() => signOut()}>
        Sign Out
      </Button>
    </div>
  );
}
