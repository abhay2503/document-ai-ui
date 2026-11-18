"use client";

import { useRef, useState, type DragEvent } from "react";
import { CircleCheck, CircleExclamationPoint, CloudUpload, LoaderCircle, RefreshCw, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ACCEPT_ATTRIBUTE,
  ACCEPTED_LABELS,
  MAX_FILE_SIZE_BYTES,
  formatBytes,
  getFileType,
  validateFile,
} from "@/lib/file-validation";

export type UploadStatus = "idle" | "uploading" | "uploaded" | "failed";

interface FileDropzoneProps {
  file: File | null;
  status: UploadStatus;
  progress: number;
  error: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onRetry: () => void;
  disabled?: boolean;
}

const TYPE_TILE: Record<string, string> = {
  PDF: "bg-rose-50 text-rose-600 ring-rose-200/70",
  DOCX: "bg-blue-50 text-blue-600 ring-blue-200/70",
  TXT: "bg-slate-100 text-slate-600 ring-slate-200/70",
};

export function FileDropzone({
  file,
  status,
  progress,
  error,
  onFileSelect,
  onRemove,
  onRetry,
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (files.length > 1) {
      setValidationError("Please upload one document at a time.");
      return;
    }
    const result = validateFile(files[0]);
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }
    setValidationError(null);
    onFileSelect(files[0]);
  }

  const dragHandlers = {
    onDragEnter: (e: DragEvent) => {
      if (disabled || !e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      dragDepth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      if (disabled || !e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
  };

  const fileType = file ? getFileType(file.name) : undefined;
  const isUploading = status === "uploading";

  return (
    <div>
      <input
        ref={inputRef}
        id="document-upload"
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      {file ? (
        <div
          {...dragHandlers}
          className={cn(
            "overflow-hidden rounded-xl border bg-card shadow-xs transition-all duration-300",
            "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-[0.98]",
            status === "uploaded" && "border-emerald-200",
            status === "failed" && "border-destructive/30",
            isDragging && "border-primary ring-4 ring-primary/10",
          )}
        >
          <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
            <div
              className={cn(
                "relative grid size-11 shrink-0 place-items-center rounded-lg text-[11px] font-bold tracking-wide ring-1",
                TYPE_TILE[fileType?.label ?? "TXT"],
              )}
              aria-hidden
            >
              {fileType?.label}
              {isUploading && (
                <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-card shadow-sm ring-1 ring-border">
                  <CloudUpload className="size-3 text-primary motion-safe:animate-pulse" />
                </span>
              )}
              {status === "uploaded" && (
                <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-card shadow-sm ring-1 ring-emerald-200 motion-safe:animate-in motion-safe:zoom-in">
                  <CircleCheck className="size-3.5 text-emerald-600" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(file.size)} · {fileType?.label} document
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" onClick={openPicker} disabled={disabled || isUploading}>
                <RefreshCw aria-hidden />
                <span className="hidden sm:inline">Replace</span>
                <span className="sr-only sm:hidden">Replace file</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setValidationError(null);
                  onRemove();
                }}
                disabled={disabled || isUploading}
                aria-label="Remove file"
                className="text-muted-foreground hover:text-destructive"
              >
                <X aria-hidden />
              </Button>
            </div>
          </div>

          <UploadStatusBar status={status} progress={progress} error={error} onRetry={onRetry} />
        </div>
      ) : (
        <div
          {...dragHandlers}
          onClick={openPicker}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 sm:py-12",
            "border-border bg-gradient-to-b from-accent/40 to-transparent hover:border-primary/40 hover:from-accent/70",
            isDragging && "scale-[1.01] border-primary bg-accent/40 from-accent",
            validationError && !isDragging && "border-destructive/40",
            disabled && "pointer-events-none opacity-60",
          )}
        >
          <div
            className={cn(
              "mb-4 grid size-12 place-items-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border transition-transform duration-200",
              "group-hover:-translate-y-0.5",
              isDragging && "-translate-y-1 scale-110",
            )}
          >
            <CloudUpload className="size-6" aria-hidden />
          </div>
          <p className="text-sm font-medium">
            {isDragging ? "Drop to upload" : "Drag and drop your document here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {ACCEPTED_LABELS.join(", ")} · up to {formatBytes(MAX_FILE_SIZE_BYTES)}
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-5 bg-card px-4 shadow-xs"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
            disabled={disabled}
          >
            Browse files
          </Button>
        </div>
      )}

      {validationError && (
        <p
          role="alert"
          className="mt-2.5 flex items-start gap-1.5 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in"
        >
          <CircleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden />
          {validationError}
        </p>
      )}
    </div>
  );
}

function UploadStatusBar({
  status,
  progress,
  error,
  onRetry,
}: {
  status: UploadStatus;
  progress: number;
  error: string;
  onRetry: () => void;
}) {
  if (status === "uploading") {
    return (
      <div className="border-t bg-muted/30 px-4 py-3" role="status" aria-live="polite">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-accent-foreground">
            <LoaderCircle className="size-3.5 motion-safe:animate-spin" aria-hidden />
            Uploading…
          </span>
          <span className="text-muted-foreground tabular-nums">{progress}%</span>
        </div>
        <Progress value={progress} aria-label="Upload progress" />
      </div>
    );
  }

  if (status === "uploaded") {
    return (
      <div
        className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50/70 px-4 py-2.5 text-sm text-emerald-700 motion-safe:animate-in motion-safe:fade-in"
        role="status"
      >
        <CircleCheck className="size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-medium">Document uploaded successfully.</span> Ready to summarize.
        </span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="flex items-center gap-3 border-t border-destructive/15 bg-destructive/5 px-4 py-2.5 motion-safe:animate-in motion-safe:fade-in"
        role="alert"
      >
        <CircleExclamationPoint className="size-4 shrink-0 text-destructive" aria-hidden />
        <p className="min-w-0 flex-1 text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 bg-card">
          <RotateCcw aria-hidden />
          Retry upload
        </Button>
      </div>
    );
  }

  return null;
}
