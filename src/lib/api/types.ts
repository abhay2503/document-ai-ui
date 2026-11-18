// Shapes of the data exchanged with the backend API.

export type SummaryStyle = "concise" | "detailed" | "bullets" | "insights";

export type JobStatus = "queued" | "processing" | "done" | "failed";

export type ProcessingStage =
  | "preparing"
  | "extracting"
  | "structuring"
  | "analyzing"
  | "generating"
  | "finalizing";

export interface Finding {
  title: string;
  detail: string;
}

export interface SummaryResult {
  documentName: string;
  style: SummaryStyle;
  overview: string;
  keyPoints: string[];
  findings: Finding[];
  actionItems: string[];
  generatedAt: string;
}

/** Response of GET /summaries/{jobId} */
export interface SummaryJob {
  jobId: string;
  documentId: string;
  status: JobStatus;
  stage?: ProcessingStage;
  result?: SummaryResult;
  error?: string;
}
