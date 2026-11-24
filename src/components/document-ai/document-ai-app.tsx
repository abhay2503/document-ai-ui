"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSummary, getErrorMessage, getSummaryJob, isDailyLimitError, uploadDocument } from "@/lib/api/client";
import type { DailyQuota, ProcessingStage, SummaryResult, SummaryStyle } from "@/lib/api/types";
import { formatQuotaReset, utcDay } from "@/lib/quota";
import { ErrorAlert } from "./error-alert";
import { FileDropzone, type UploadStatus } from "./file-dropzone";
import { FollowUpChat } from "./follow-up-chat";
import { Hero } from "./hero";
import { InstructionsField } from "./instructions-field";
import { ProcessingState } from "./processing-state";
import { SectionLabel } from "./section-label";
import { SiteHeader } from "./site-header";
import { SummaryResults } from "./summary-results";
import { SummaryStylePicker } from "./summary-style-picker";

const POLL_EVERY_MS = 2000;
const MAX_POLLS = 300; // 300 × 2s = 10 minutes

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function DocumentAiApp() {
  // Step 1 — upload
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [documentId, setDocumentId] = useState("");

  // Step 3 — options (step 2, custom instructions, is "coming soon")
  const [style, setStyle] = useState<SummaryStyle>("concise");

  // Step 4 — summary job
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<ProcessingStage | undefined>();
  const [jobId, setJobId] = useState("");
  const [jobError, setJobError] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);

  // Daily quota — only known after a POST /summaries response or a 429 (there's no GET).
  const [quota, setQuota] = useState<DailyQuota | null>(null);
  const [quotaDay, setQuotaDay] = useState(""); // UTC day the quota belongs to
  const [limitReachedOn, setLimitReachedOn] = useState(""); // UTC day a 429 was received

  /** Upload starts as soon as a file is chosen. */
  async function handleFileSelect(selected: File) {
    setFile(selected);
    setDocumentId("");
    setUploadError("");
    setUploadProgress(0);
    setUploadStatus("uploading");

    try {
      const id = await uploadDocument(selected, setUploadProgress);
      setDocumentId(id);
      setUploadStatus("uploaded");
    } catch (error) {
      setUploadError(getErrorMessage(error));
      setUploadStatus("failed");
    }
  }

  function handleRemoveFile() {
    setFile(null);
    setDocumentId("");
    setUploadStatus("idle");
  }

  /** Generate only runs when the user clicks the button. */
  async function handleGenerate() {
    setJobError("");
    setIsProcessing(true);
    setStage(undefined);

    try {
      const res = await createSummary(documentId, style);
      setQuota(res);
      setQuotaDay(utcDay());
      setJobId(res.jobId);
      await waitForResult(res.jobId);
    } catch (error) {
      if (isDailyLimitError(error)) {
        setLimitReachedOn(utcDay());
        if (quota) {
          setQuota({ ...quota, dailyUsed: quota.dailyLimit, dailyRemaining: 0 });
          setQuotaDay(utcDay());
        }
        const limit = quota ? `${quota.dailyLimit} ` : "";
        setJobError(`You've used all ${limit}summaries for today. You can create more after ${formatQuotaReset()}.`);
      } else {
        setJobError(getErrorMessage(error));
      }
    } finally {
      setIsProcessing(false);
    }
  }

  /** Ask the backend for the job status every 2 seconds until it is done or failed. */
  async function waitForResult(id: string) {
    for (let i = 0; i < MAX_POLLS; i++) {
      const job = await getSummaryJob(id);

      if (job.status === "done" && job.result) {
        setResult(job.result);
        return;
      }
      if (job.status === "failed") {
        throw new Error(job.error || "We couldn't process this document.");
      }

      setStage(job.stage);
      await sleep(POLL_EVERY_MS);
    }
    throw new Error("This is taking longer than usual. Please check again in a moment.");
  }

  /** Keep checking the same job (e.g. after a network hiccup) — it may still be running. */
  async function handleCheckAgain() {
    setJobError("");
    setIsProcessing(true);
    try {
      await waitForResult(jobId);
    } catch (error) {
      setJobError(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }

  // Recomputed every render, so it clears by itself after 00:00 UTC.
  const today = utcDay();
  const gotLimitError = limitReachedOn === today;
  const limitReached = gotLimitError || (quota?.dailyRemaining === 0 && quotaDay === today);
  const quotaKnown = quota !== null && quotaDay === today;

  const canGenerate = uploadStatus === "uploaded" && !isProcessing && !limitReached;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden">
      <BackgroundDecor />
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 sm:px-6">
        <Hero />

        <section className="rounded-2xl border bg-card/90 p-5 shadow-xl ring-1 shadow-primary/5 ring-white/60 backdrop-blur-sm sm:p-8">
          <div className="space-y-8">
            <div>
              <SectionLabel step={1} title="Upload document" />
              <FileDropzone
                file={file}
                status={uploadStatus}
                progress={uploadProgress}
                error={uploadError}
                onFileSelect={handleFileSelect}
                onRemove={handleRemoveFile}
                onRetry={() => file && handleFileSelect(file)}
                disabled={isProcessing}
              />
            </div>

            <InstructionsField />

            <SummaryStylePicker value={style} onChange={setStyle} disabled={isProcessing} />

            <div className="space-y-3 border-t pt-6">
              {isProcessing ? (
                <ProcessingState stage={stage} fileName={file?.name ?? ""} />
              ) : (
                <>
                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="bg-brand-gradient h-12 w-full gap-2 rounded-xl text-[15px] font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-px hover:shadow-xl hover:shadow-primary/30 disabled:shadow-none"
                  >
                    <Sparkles className="size-4.5" aria-hidden />
                    Generate summary
                  </Button>
                  {!file && (
                    <p className="text-center text-xs text-muted-foreground">Upload a document to get started.</p>
                  )}
                  {limitReached ? (
                    <p className="text-center text-xs text-muted-foreground">
                      Daily limit reached. Resets at {formatQuotaReset()}.
                    </p>
                  ) : (
                    quotaKnown && (
                      <p className="text-center text-xs text-muted-foreground">
                        {quota.dailyRemaining} of {quota.dailyLimit}{" "}
                        {quota.dailyRemaining === 1 ? "summary" : "summaries"} left today
                      </p>
                    )
                  )}
                </>
              )}

              {jobError && (
                <ErrorAlert
                  title={gotLimitError ? "Daily limit reached" : "Couldn't get the summary"}
                  message={jobError}
                  actions={
                    gotLimitError
                      ? []
                      : [
                          { label: "Try again", onClick: handleGenerate },
                          ...(jobId ? [{ label: "Check again", onClick: handleCheckAgain }] : []),
                        ]
                  }
                />
              )}
            </div>
          </div>
        </section>

        {result && (
          <div className="mt-8 space-y-6">
            <SummaryResults result={result} />
            <FollowUpChat key={jobId} jobId={jobId} documentName={result.documentName} />
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        DocuMind AI · AI-generated summaries can contain mistakes. Check important details.
      </footer>
    </div>
  );
}

export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden">
      <div className="absolute top-[-14rem] left-1/2 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.13_295/0.45),transparent)] blur-2xl" />
      <div className="absolute top-20 right-[-12rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.83_0.11_255/0.4),transparent)] blur-2xl" />
    </div>
  );
}
