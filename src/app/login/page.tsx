import { LoginView } from "@/components/auth/login-view";
import { BackgroundDecor } from "@/components/document-ai/document-ai-app";
import { SiteHeader } from "@/components/document-ai/site-header";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden">
      <BackgroundDecor />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <LoginView initialState={mode === "signup" ? "signUp" : "signIn"} />
      </main>
    </div>
  );
}
