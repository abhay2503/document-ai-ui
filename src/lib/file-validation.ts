export interface AcceptedFileType {
  extension: string;
  mimeType: string;
  label: string;
}

/** Formats the backend can process. Extend this list as support grows. */
export const ACCEPTED_FILE_TYPES: readonly AcceptedFileType[] = [
  { extension: ".pdf", mimeType: "application/pdf", label: "PDF" },
  {
    extension: ".docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX",
  },
  { extension: ".txt", mimeType: "text/plain", label: "TXT" },
];

/** 10 MB — matches API Gateway's maximum request payload size. */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Value for an `<input type="file" accept="…">` attribute. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_FILE_TYPES.flatMap((t) => [t.extension, t.mimeType]).join(",");

export const ACCEPTED_LABELS = ACCEPTED_FILE_TYPES.map((t) => t.label);

export function getFileType(fileName: string): AcceptedFileType | undefined {
  const name = fileName.toLowerCase();
  return ACCEPTED_FILE_TYPES.find((t) => name.endsWith(t.extension));
}

export type FileValidationResult =
  | { ok: true; fileType: AcceptedFileType }
  | { ok: false; error: string };

export function validateFile(file: File): FileValidationResult {
  const fileType = getFileType(file.name);
  if (!fileType) {
    return {
      ok: false,
      error: `“${file.name}” isn't supported. Upload a ${formatList(ACCEPTED_LABELS)} file.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, error: `“${file.name}” is empty.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `“${file.name}” is ${formatBytes(file.size)}. The maximum size is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`,
    };
  }
  return { ok: true, fileType };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
