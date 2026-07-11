import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
} from "docx";

import type { PdfLayoutConversionSummary } from "@/types/pdf";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PDF_WORKER_SRC = "pdfjs-dist/build/pdf.worker.min.mjs";
const A4_WIDTH_TWIPS = 11906;
const A4_HEIGHT_TWIPS = 16838;
const PAGE_MARGIN_TWIPS = 360;
const MAX_IMAGE_WIDTH = 746;
const MAX_IMAGE_HEIGHT = 1074;

interface PdfImagePage {
  data: Uint8Array;
  width: number;
  height: number;
}

export interface CreateWordDocumentFromPdfImagesOptions {
  file: File;
  imageQuality?: number;
  scale?: number;
}

export interface CreateWordDocumentFromPdfImagesResult {
  blob: Blob;
  summary: PdfLayoutConversionSummary;
}

function ensureBrowser() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF to Word conversion is only available in a browser.");
  }
}

function isPasswordError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "PasswordException" ||
    /password/i.test(error.message) ||
    /need.*password/i.test(error.message)
  );
}

function fitImageToPage(width: number, height: number) {
  const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height, 1);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function canvasToPngBytes(canvas: HTMLCanvasElement, imageQuality: number) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png", imageQuality);
  });

  if (!blob) {
    throw new Error("Unable to create page image from the PDF.");
  }

  return new Uint8Array(await blob.arrayBuffer());
}

export async function createWordDocumentFromPdfImages({
  file,
  imageQuality = 0.95,
  scale = 2,
}: CreateWordDocumentFromPdfImagesOptions): Promise<CreateWordDocumentFromPdfImagesResult> {
  ensureBrowser();

  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      PDF_WORKER_SRC,
      import.meta.url
    ).toString();

    const bytes = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({
      data: bytes,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    const renderedPages: PdfImagePage[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("Your browser could not prepare the PDF rendering canvas.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      try {
        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const fittedSize = fitImageToPage(canvas.width, canvas.height);
        const data = await canvasToPngBytes(canvas, imageQuality);

        renderedPages.push({
          data,
          ...fittedSize,
        });
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }
    }

    await pdf.destroy();

    if (renderedPages.length === 0) {
      throw new Error("No pages were found in this PDF.");
    }

    const children: Paragraph[] = [];

    renderedPages.forEach((page, index) => {
      if (index > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new ImageRun({
              type: "png",
              data: page.data,
              transformation: {
                width: page.width,
                height: page.height,
              },
              altText: {
                title: `PDF page ${index + 1}`,
                description: "Rendered PDF page",
                name: `PDF page ${index + 1}`,
              },
            }),
          ],
        })
      );
    });

    const wordDocument = new Document({
      creator: "PDFCraft",
      title: "Layout Preserved Word Document",
      description: "PDF pages converted into a visually preserved Word document.",
      sections: [
        {
          properties: {
            page: {
              size: {
                width: A4_WIDTH_TWIPS,
                height: A4_HEIGHT_TWIPS,
              },
              margin: {
                top: PAGE_MARGIN_TWIPS,
                right: PAGE_MARGIN_TWIPS,
                bottom: PAGE_MARGIN_TWIPS,
                left: PAGE_MARGIN_TWIPS,
              },
            },
          },
          children,
        },
      ],
    });

    const packed = await Packer.toBlob(wordDocument);
    const copy = await packed.arrayBuffer();

    return {
      blob: new Blob([copy], { type: DOCX_MIME_TYPE }),
      summary: {
        pagesRendered: renderedPages.length,
        layoutMode: "Preserved visual layout",
        editability: "Page content inserted as images",
      },
    };
  } catch (error) {
    if (isPasswordError(error)) {
      throw new Error(
        "This PDF appears to be password protected. Please unlock it first, then try converting again."
      );
    }

    throw new Error(
      error instanceof Error
        ? `Unable to preserve PDF layout: ${error.message}`
        : "Unable to preserve PDF layout."
    );
  }
}
