"use client";

import { FileText, MessageSquare, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { BackgroundDecor } from "@/components/document-ai/document-ai-app";
import { SiteHeader } from "@/components/document-ai/site-header";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Upload,
    title: "Upload any document",
    text: "Drop in a PDF, Word file or text document. It goes straight to secure storage.",
  },
  {
    icon: FileText,
    title: "Get an AI summary",
    text: "Pick a style — concise, detailed or bullet points — and get the key insights in seconds.",
  },
  {
    icon: MessageSquare,
    title: "Ask follow-up questions",
    text: "Chat with your document to dig into the details that matter to you.",
  },
  {
    icon: ShieldCheck,
    title: "Private to your account",
    text: "Sign in with your account to keep your documents and summaries to yourself.",
  },
];

/** Shown to signed-out visitors. Log In / Sign Up open the Amplify UI sign-in page (/login). */
export function LandingPage() {
  const { signIn, signUp } = useAuth();

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden">
      <BackgroundDecor />
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 sm:px-6">
        <section className="mx-auto max-w-2xl pt-16 pb-12 text-center sm:pt-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="bg-brand-gradient size-1.5 rounded-full" aria-hidden />
            Document intelligence
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Understand documents. <span className="text-brand-gradient">Faster.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
            DocuMind AI reads your documents and gives you clear summaries and answers, so you spend less time
            reading and more time deciding.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="px-5" onClick={() => signUp()}>
              Get started — Sign Up
            </Button>
            <Button size="lg" variant="outline" className="px-5" onClick={() => signIn()}>
              Log In
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card/90 p-5 shadow-sm ring-1 shadow-primary/5 ring-white/60 backdrop-blur-sm"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <h2 className="mt-4 text-sm font-semibold tracking-tight">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
