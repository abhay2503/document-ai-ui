"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Download, FileText, Lightbulb, ListChecks, ScrollText, Target, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SummaryResult } from "@/lib/api/types";
import { SUMMARY_STYLES } from "@/lib/summary-styles";
import { downloadTextFile, summaryFileName, summaryToMarkdown } from "@/lib/summary-export";

interface SummaryResultsProps {
  result: SummaryResult;
}

export function SummaryResults({ result }: SummaryResultsProps) {
  const styleLabel = SUMMARY_STYLES.find((s) => s.value === result.style)?.label ?? result.style;
  const generatedAt = new Date(result.generatedAt);

  return (
    <section
      aria-labelledby="results-heading"
      className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-brand-gradient grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md shadow-primary/25">
            <FileText className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 id="results-heading" className="text-lg font-semibold tracking-tight">
              Your summary
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="max-w-56 truncate" title={result.documentName}>
                {result.documentName}
              </span>
              <Badge variant="secondary" className="rounded-md">
                {styleLabel}
              </Badge>
              {!Number.isNaN(generatedAt.getTime()) && (
                <time dateTime={result.generatedAt}>
                  {generatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </time>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyButton text={summaryToMarkdown(result)} />
          <Button
            variant="outline"
            size="lg"
            className="px-3"
            onClick={() => downloadTextFile(summaryFileName(result.documentName), summaryToMarkdown(result))}
          >
            <Download aria-hidden />
            Download
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-primary/10 bg-gradient-to-br from-accent/70 via-accent/30 to-transparent p-5">
        <SectionTitle icon={ScrollText} title="Document overview" />
        <p className="mt-3 text-[15px] leading-relaxed text-pretty whitespace-pre-line">{result.overview}</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ResultCard icon={Target} title="Key points" count={result.keyPoints.length}>
          <ol className="space-y-3">
            {result.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-accent text-[11px] font-semibold text-accent-foreground tabular-nums">
                  {i + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </ResultCard>

        <ResultCard icon={Lightbulb} title="Important findings" count={result.findings.length}>
          <ul className="space-y-3">
            {result.findings.map((finding, i) => (
              <li key={i} className="rounded-lg border-l-2 border-primary/50 bg-muted/50 py-2 pr-3 pl-3">
                <p className="text-sm font-medium">{finding.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{finding.detail}</p>
              </li>
            ))}
          </ul>
        </ResultCard>

        <ResultCard icon={ListChecks} title="Action items" count={result.actionItems.length} className="md:col-span-2">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {result.actionItems.map((item, i) => (
              <li key={i} className="flex gap-2.5 rounded-lg border bg-card p-3 text-sm leading-relaxed">
                <span className="mt-0.5 size-4 shrink-0 rounded-[5px] border-2 border-primary/40" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ResultCard>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count?: number }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold">
      <Icon className="size-4 text-primary" aria-hidden />
      {title}
      {count !== undefined && count > 0 && (
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </h3>
  );
}

function ResultCard({
  icon,
  title,
  count,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <SectionTitle icon={icon} title={title} count={count} />
      <div className="mt-4">
        {count > 0 ? children : <p className="text-sm text-muted-foreground">Nothing identified in this document.</p>}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <Button variant="outline" size="lg" className="px-3" onClick={copy} aria-live="polite">
      {state === "copied" ? <Check className="text-emerald-600" aria-hidden /> : <Copy aria-hidden />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
    </Button>
  );
}
