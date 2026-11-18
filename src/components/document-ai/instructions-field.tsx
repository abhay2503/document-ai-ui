import { Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SectionLabel } from "./section-label";

/** Custom instructions — not available yet, shown as "Coming soon". */
export function InstructionsField() {
  return (
    <div>
      <SectionLabel
        as="label"
        htmlFor="instructions"
        step={2}
        title="What would you like to know?"
        hint={
          <span className="bg-brand-gradient inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm shadow-primary/20">
            Coming soon
          </span>
        }
      />
      <div className="relative">
        <Textarea
          id="instructions"
          disabled
          rows={3}
          placeholder="Example: Summarize this document in simple language, highlight important points, and identify key decisions."
          className="min-h-24 resize-none rounded-xl border-dashed bg-muted/40 px-3.5 py-3 leading-relaxed placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:opacity-100"
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl bg-gradient-to-b from-transparent via-card/40 to-card/70">
          <p className="flex items-center gap-1.5 rounded-full border bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-sm">
            <Lock className="size-3" aria-hidden />
            Custom instructions are coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
