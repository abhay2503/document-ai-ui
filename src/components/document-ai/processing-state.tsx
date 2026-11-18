import { Circle, CircleCheck, LoaderCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStage } from "@/lib/api/types";
import { PROCESSING_STAGES } from "@/lib/processing-stages";

interface ProcessingStateProps {
  /** Stage reported by the backend (undefined until it reports one). */
  stage?: ProcessingStage;
  fileName: string;
}

export function ProcessingState({ stage, fileName }: ProcessingStateProps) {
  const currentIndex = PROCESSING_STAGES.findIndex((s) => s.value === stage);
  const title = currentIndex >= 0 ? PROCESSING_STAGES[currentIndex].label : "Processing your document";

  return (
    <div
      className="rounded-xl border border-primary/15 bg-gradient-to-br from-accent/60 via-card to-card p-5 motion-safe:animate-in motion-safe:fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3.5">
        <div className="bg-brand-gradient relative grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md shadow-primary/25">
          <span className="absolute inset-0 rounded-xl bg-primary/40 motion-safe:animate-ping [animation-duration:2s]" aria-hidden />
          <Sparkles className="relative size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p key={title} className="text-sm font-semibold motion-safe:animate-in motion-safe:fade-in">
            {title}…
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{fileName}</p>
        </div>
      </div>

      {/* Moving bar, no percentage — the backend doesn't report one. */}
      <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="bg-brand-gradient absolute inset-y-0 w-1/3 rounded-full motion-safe:animate-[indeterminate_1.4s_ease-in-out_infinite]" />
      </div>

      <ol className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {PROCESSING_STAGES.map((s, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={s.value}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-300",
                done && "text-foreground",
                active && "font-medium text-accent-foreground",
                !done && !active && "text-muted-foreground/60",
              )}
            >
              {done ? (
                <CircleCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
              ) : active ? (
                <LoaderCircle className="size-3.5 shrink-0 motion-safe:animate-spin" aria-hidden />
              ) : (
                <Circle className="size-3.5 shrink-0" aria-hidden />
              )}
              {s.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
