import { createWordDocumentFromPages } from "@/lib/pdf/createWordDocument";
import { extractTextFromPdf } from "@/lib/pdf/extractPdfText";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function convertPdfToWord(file: File): Promise<Blob> {
  if (!file) {
    throw new Error("Please choose a PDF file.");
  }

  if (!isPdfFile(file)) {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("PDF file size must be 25 MB or less.");
  }

  const pages = await extractTextFromPdf(file);
  const hasReadableText = pages.some((page) => page.text.trim().length > 0);

  if (!hasReadableText) {
    throw new Error(
      "No readable text was found in this PDF. Scanned documents may require OCR conversion."
    );
  }

  return createWordDocumentFromPages(pages);
}
