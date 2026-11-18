import axios from "axios";
import { getFileType } from "@/lib/file-validation";
import type { SummaryJob, SummaryStyle } from "./types";

// Our backend (API Gateway). Set NEXT_PUBLIC_API_BASE_URL in .env.local
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30_000,
});

/**
 * Upload a document in three steps:
 *   1. POST /uploads                          → get a presigned S3 URL
 *   2. PUT  the file straight to S3           → report progress
 *   3. POST /documents/{documentId}/complete  → tell the backend it's done
 * Returns the documentId.
 */
export async function uploadDocument(file: File, onProgress: (percent: number) => void): Promise<string> {
  const contentType = getFileType(file.name)?.mimeType ?? "application/octet-stream";

  // 1. Ask for an upload URL
  const { data } = await api.post<{ documentId: string; key: string; uploadUrl: string }>("/uploads", {
    fileName: file.name,
    contentType,
    size: file.size,
  });

  // 2. Upload to S3 (slice() makes sure the Content-Type matches the signed URL)
  await axios.put(data.uploadUrl, file.slice(0, file.size, contentType), {
    headers: { "Content-Type": contentType },
    onUploadProgress: (event) => {
      if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  // 3. Confirm the upload
  await api.post(`/documents/${data.documentId}/complete`);

  return data.documentId;
}

/** POST /summaries → starts processing and returns a jobId */
export async function createSummary(documentId: string, style: SummaryStyle): Promise<string> {
  const { data } = await api.post<{ jobId: string }>("/summaries", { documentId, style });
  return data.jobId;
}

/** GET /summaries/{jobId} → current status, stage and (when done) the result */
export async function getSummaryJob(jobId: string): Promise<SummaryJob> {
  const { data } = await api.get<SummaryJob>(`/summaries/${jobId}`);
  return data;
}

/** POST /summaries/{jobId}/questions → answer to a follow-up question */
export async function askFollowUp(jobId: string, question: string): Promise<string> {
  const { data } = await api.post<{ answer: string }>(`/summaries/${jobId}/questions`, { question });
  return data.answer;
}

/** Turn any error into a short message for the UI. */
export function getErrorMessage(error: unknown): string {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return "The API isn't configured yet. Set NEXT_PUBLIC_API_BASE_URL in .env.local.";
  }
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (!error.response) return "Couldn't reach the server. Please check your connection.";
    return `Request failed (${error.response.status}). Please try again.`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
