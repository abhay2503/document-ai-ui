import { Check, FileText, Lightbulb, List, TextAlignStart, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SummaryStyle } from "@/lib/api/types";
import { SUMMARY_STYLES } from "@/lib/summary-styles";
import { SectionLabel } from "./section-label";

const ICONS: Record<SummaryStyle, LucideIcon> = {
  concise: TextAlignStart,
  detailed: FileText,
  bullets: List,
  insights: Lightbulb,
};

interface SummaryStylePickerProps {
  value: SummaryStyle;
  onChange: (value: SummaryStyle) => void;
  disabled?: boolean;
}

export function SummaryStylePicker({ value, onChange, disabled }: SummaryStylePickerProps) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <SectionLabel as="legend" step={3} title="Summary style" />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {SUMMARY_STYLES.map((option) => {
          const Icon = ICONS[option.value];
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer flex-col gap-2.5 rounded-xl border bg-card p-3.5 shadow-xs transition-all duration-150",
                "hover:border-primary/40 hover:shadow-sm",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
                selected && "border-primary/60 bg-accent/50 shadow-sm ring-1 ring-primary/20",
              )}
            >
              <input
                type="radio"
                name="summary-style"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition-colors",
                    selected ? "bg-brand-gradient text-white shadow-sm shadow-primary/25" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span
                  className={cn(
                    "grid size-4.5 place-items-center rounded-full border transition-all",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                  aria-hidden
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </span>
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
