export function getProtectedPdfFilename(originalName: string): string {
  const withoutPdf = originalName.replace(/\.pdf$/i, "");

  return `${withoutPdf || "document"}-protected.pdf`;
}

export function getUnlockedPdfFilename(originalName: string): string {
  const withoutPdf = originalName.replace(/\.pdf$/i, "");

  return `${withoutPdf || "document"}-unlocked.pdf`;
}

export function getEditedPdfFilename(originalName: string): string {
  const withoutPdf = originalName.replace(/\.pdf$/i, "");

  return `${withoutPdf || "document"}-edited.pdf`;
}

export function getWordDocumentFilename(originalName: string): string {
  const withoutPdf = originalName.replace(/\.pdf$/i, "");

  return `${withoutPdf || "document"}.docx`;
}

export function getLayoutWordDocumentFilename(originalName: string): string {
  const withoutPdf = originalName.replace(/\.pdf$/i, "");

  return `${withoutPdf || "document"}-layout.docx`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Downloads are only available in a browser.");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
