"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { DocumentAiApp } from "@/components/document-ai/document-ai-app";
import { LandingPage } from "@/components/landing/landing-page";

/** Signed out → landing page. Signed in → the DocuMind app. */
export function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  return isAuthenticated ? <DocumentAiApp /> : <LandingPage />;
}
