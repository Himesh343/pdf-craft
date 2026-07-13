import { createWordDocumentFromPages } from "@/lib/pdf/createWordDocument";
import { createWordDocumentFromPdfImages } from "@/lib/pdf/createWordFromPdfImages";
import { extractTextFromPdf } from "@/lib/pdf/extractPdfText";
import {
  getLayoutWordDocumentFilename,
  getWordDocumentFilename,
} from "@/lib/pdf/downloadFile";
import type {
  PdfConversionQuality,
  PdfToWordOptions,
  PdfToWordResult,
} from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function createQualitySummary(
  pages: Awaited<ReturnType<typeof extractTextFromPdf>>
): PdfConversionQuality {
  const totalPages = pages.length;
  const extractedPages = pages.filter((page) => page.text.trim().length > 0).length;
  const totalCharacters = pages.reduce((total, page) => total + page.text.length, 0);
  const detectedHeadings = pages.reduce(
    (total, page) =>
      total + page.paragraphs.filter((paragraph) => paragraph.type === "heading").length,
    0
  );
  const detectedParagraphs = pages.reduce(
    (total, page) => total + page.paragraphs.length,
    0
  );
  const warnings: string[] = [];

  if (
    pages.some((page) =>
      page.paragraphs.some((paragraph) => paragraph.type === "table-like")
    )
  ) {
    warnings.push("Some table-like content was detected and converted as formatted text.");
  }

  if (extractedPages < totalPages) {
    warnings.push("Scanned pages may require OCR conversion.");
  }

  return {
    totalPages,
    extractedPages,
    totalCharacters,
    detectedHeadings,
    detectedParagraphs,
    warnings,
  };
}

export async function convertPdfToWord({
  file,
  mode,
}: PdfToWordOptions): Promise<PdfToWordResult> {
  if (!file) {
    throw new Error("Please choose a PDF file.");
  }

  if (!isPdfFile(file)) {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("File size must be under 25 MB.");
  }

  if (mode === "preserve-layout") {
    const conversion = await createWordDocumentFromPdfImages({ file });
    const warnings = [
      "Text may not be directly editable in Preserve Layout mode because each PDF page is inserted as an image.",
    ];

    if (file.size > 10 * 1024 * 1024) {
      warnings.push("Large PDFs may take longer to process and may generate larger Word files.");
    }

    return {
      blob: conversion.blob,
      fileName: getLayoutWordDocumentFilename(file.name),
      visualSummary: conversion.summary,
      mode,
      message:
        "Your PDF has been converted into a Word document that closely matches the original visual layout.",
      warnings,
    };
  }

  if (mode !== "basic") {
    throw new Error("This conversion mode is not available yet.");
  }

  const pages = await extractTextFromPdf(file);
  const hasReadableText = pages.some((page) => page.text.trim().length > 0);

  if (!hasReadableText) {
    throw new Error(
      "No readable text was found in this PDF. Scanned documents may require OCR conversion."
    );
  }

  const blob = await createWordDocumentFromPages(pages);
  const quality = createQualitySummary(pages);
  const warnings = [
    "Some layout details may change because this mode prioritizes editable text.",
    ...quality.warnings,
  ];

  if (file.size > 10 * 1024 * 1024) {
    warnings.push("Large PDFs may take longer to process and may generate larger Word files.");
  }

  return {
    blob,
    fileName: getWordDocumentFilename(file.name),
    quality,
    mode,
    message: "Your PDF text has been converted into an editable Word document.",
    warnings,
  };
}
