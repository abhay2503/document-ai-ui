export function Hero() {
  return (
    <section className="mx-auto max-w-2xl pt-6 pb-5 text-center sm:pt-8 sm:pb-6">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
        <span className="bg-brand-gradient size-1.5 rounded-full" aria-hidden />
        Document intelligence
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Understand documents. <span className="text-brand-gradient">Faster.</span>
      </h1>
      <p className="mx-auto mt-2 max-w-lg text-sm text-pretty text-muted-foreground sm:text-base">
        Upload your documents and let AI extract the insights that matter.
      </p>
    </section>
  );
}
