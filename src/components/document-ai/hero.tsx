export function Hero() {
  return (
    <section className="mx-auto max-w-2xl pt-14 pb-10 text-center sm:pt-20 sm:pb-12">
      <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
        <span className="bg-brand-gradient size-1.5 rounded-full" aria-hidden />
        Document intelligence
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
        Understand documents. <span className="text-brand-gradient">Faster.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
        Upload your documents and let AI extract the insights that matter.
      </p>
    </section>
  );
}
