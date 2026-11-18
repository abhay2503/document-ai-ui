import type { SummaryStyle } from "./api/types";

export interface SummaryStyleOption {
  value: SummaryStyle;
  label: string;
  description: string;
}

export const SUMMARY_STYLES: readonly SummaryStyleOption[] = [
  { value: "concise", label: "Concise", description: "The essentials in a short read" },
  { value: "detailed", label: "Detailed", description: "In-depth coverage of every section" },
  { value: "bullets", label: "Bullet points", description: "Scannable list of main ideas" },
  { value: "insights", label: "Key insights", description: "Findings, risks and decisions" },
];
