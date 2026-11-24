import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthButton } from "./auth-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="bg-brand-gradient grid size-8 place-items-center rounded-lg text-white shadow-md shadow-primary/25">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            DocuMind <span className="text-brand-gradient">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent/70 px-3 py-1 text-xs font-medium text-accent-foreground">
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inline-flex size-full rounded-full bg-primary/60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            AI-powered
          </span>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
