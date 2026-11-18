import type { ProcessingStage } from "./api/types";

export interface ProcessingStageOption {
  value: ProcessingStage;
  label: string;
}

/** Backend stages in order, with the message shown for each. */
export const PROCESSING_STAGES: readonly ProcessingStageOption[] = [
  { value: "preparing", label: "Preparing your document" },
  { value: "extracting", label: "Extracting document content" },
  { value: "structuring", label: "Understanding document structure" },
  { value: "analyzing", label: "Analyzing important information" },
  { value: "generating", label: "Generating your AI summary" },
  { value: "finalizing", label: "Preparing your results" },
];
