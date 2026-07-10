import type { PdfExtractedPage } from "@/types/pdf";

const PDF_WORKER_SRC = "pdfjs-dist/build/pdf.worker.min.mjs";

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
};

type PdfTextLike = {
  str?: unknown;
  transform?: unknown;
};

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("PDF to Word conversion is only available in a browser.");
  }
}

function isTextItem(item: unknown): item is PdfTextItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as PdfTextLike;
  return typeof candidate.str === "string" && Array.isArray(candidate.transform);
}

function normalizeLine(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function buildReadablePageText(items: PdfTextItem[]) {
  const positionedItems = items
    .map((item) => ({
      text: item.str,
      x: Number(item.transform[4] ?? 0),
      y: Number(item.transform[5] ?? 0),
    }))
    .filter((item) => item.text.trim().length > 0)
    .sort((left, right) => {
      const yDifference = right.y - left.y;

      if (Math.abs(yDifference) > 3) {
        return yDifference;
      }

      return left.x - right.x;
    });

  const lines: Array<{ y: number; parts: string[] }> = [];

  for (const item of positionedItems) {
    const currentLine = lines.at(-1);

    if (!currentLine || Math.abs(currentLine.y - item.y) > 3) {
      lines.push({ y: item.y, parts: [item.text] });
    } else {
      currentLine.parts.push(item.text);
    }
  }

  return lines
    .map((line) => normalizeLine(line.parts.join(" ")))
    .filter(Boolean)
    .join("\n");
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

export async function extractTextFromPdf(file: File): Promise<PdfExtractedPage[]> {
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
      disableFontFace: true,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    const pages: PdfExtractedPage[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const items: PdfTextItem[] = [];

      for (const item of textContent.items) {
        if (isTextItem(item)) {
          items.push(item);
        }
      }

      pages.push({
        pageNumber,
        text: buildReadablePageText(items),
      });
    }

    await pdf.destroy();

    return pages;
  } catch (error) {
    if (isPasswordError(error)) {
      throw new Error(
        "This PDF appears to be password protected. Please unlock it first, then try converting again."
      );
    }

    throw new Error(
      error instanceof Error
        ? `Unable to read PDF: ${error.message}`
        : "Unable to read PDF."
    );
  }
}
