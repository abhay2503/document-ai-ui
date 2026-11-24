"use client";

import "@/lib/auth/amplify-config";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession, getCurrentUser, signOut, type AuthUser } from "aws-amplify/auth";

type AuthContextValue = {
  user: AuthUser | null;
  email: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signUp: () => void;
  signOut: () => Promise<void>;
  getCurrentUser: typeof getCurrentUser;
  getSession: typeof fetchAuthSession;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser();
      // Amplify has already parsed the ID token; we only read the email claim.
      const session = await fetchAuthSession();
      setUser(currentUser);
      setEmail(String(session.tokens?.idToken?.payload.email ?? currentUser.username));
    } catch {
      setUser(null);
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    // Refresh when the user signs in (Amplify UI or redirect) or signs out.
    return Hub.listen("auth", ({ payload }) => {
      if (["signedIn", "signInWithRedirect", "signedOut"].includes(payload.event)) loadUser();
      if (payload.event === "signInWithRedirect_failure") {
        console.error("Cognito sign-in failed", payload.data);
        setIsLoading(false);
      }
    });
  }, []);

  const value: AuthContextValue = {
    user,
    email,
    isAuthenticated: user !== null,
    isLoading,
    // Both open the Amplify UI Authenticator on /login.
    signIn: () => router.push("/login"),
    signUp: () => router.push("/login?mode=signup"),
    signOut: () => signOut(),
    getCurrentUser,
    getSession: fetchAuthSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
