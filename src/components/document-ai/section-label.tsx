import type { ReactNode } from "react";

interface SectionLabelProps {
  step: number;
  title: string;
  htmlFor?: string;
  hint?: ReactNode;
  /** Render as a <legend> inside a <fieldset>. */
  as?: "label" | "legend" | "h2";
}

export function SectionLabel({ step, title, htmlFor, hint, as = "h2" }: SectionLabelProps) {
  const content = (
    <>
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground tabular-nums">
        {step}
      </span>
      <span className="text-sm font-semibold tracking-tight">{title}</span>
      {hint && <span className="ml-auto text-xs font-normal text-muted-foreground">{hint}</span>}
    </>
  );
  const className = "mb-3 flex w-full items-center gap-2.5";

  if (as === "label") {
    return (
      <label htmlFor={htmlFor} className={className}>
        {content}
      </label>
    );
  }
  if (as === "legend") {
    return <legend className={className}>{content}</legend>;
  }
  return <h2 className={className}>{content}</h2>;
}
