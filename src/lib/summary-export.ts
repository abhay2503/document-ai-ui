import type { SummaryResult } from "./api/types";
import { SUMMARY_STYLES } from "./summary-styles";

export function summaryToMarkdown(result: SummaryResult): string {
  const styleLabel = SUMMARY_STYLES.find((s) => s.value === result.style)?.label ?? result.style;
  const lines: string[] = [
    `# Summary — ${result.documentName}`,
    "",
    `_${styleLabel} · Generated ${new Date(result.generatedAt).toLocaleString()}_`,
  ];
  lines.push("", "## Overview", "", result.overview);

  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push("", `## ${title}`, "", ...items);
  };
  section("Key points", result.keyPoints.map((p) => `- ${p}`));
  section("Important findings", result.findings.map((f) => `- **${f.title}:** ${f.detail}`));
  section("Action items", result.actionItems.map((a) => `- [ ] ${a}`));

  return `${lines.join("\n")}\n`;
}

export function downloadTextFile(fileName: string, content: string, mimeType = "text/markdown") {
  const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function summaryFileName(documentName: string): string {
  const base = documentName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-") || "document";
  return `${base}-summary.md`;
}
