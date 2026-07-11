import type {
  PdfExtractedLine,
  PdfExtractedPage,
  PdfExtractedParagraph,
  PdfTextItem,
} from "@/types/pdf";

const PDF_WORKER_SRC = "pdfjs-dist/build/pdf.worker.min.mjs";
const LINE_Y_TOLERANCE = 3.5;

interface RawPdfTextItem {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
  fontName?: string;
}

type RawPdfTextLike = {
  str?: unknown;
  transform?: unknown;
  width?: unknown;
  height?: unknown;
  fontName?: unknown;
};

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("PDF to Word conversion is only available in a browser.");
  }
}

function isRawTextItem(item: unknown): item is RawPdfTextItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as RawPdfTextLike;

  return typeof candidate.str === "string" && Array.isArray(candidate.transform);
}

function cleanText(text: string) {
  return text.replace(/[\t\u00a0]+/g, " ").replace(/\s+/g, " ").trim();
}

function cleanFormattedText(text: string) {
  return text.replace(/[\t\u00a0]+/g, " ").replace(/ {5,}/g, "    ").trim();
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

function toPositionedTextItem(item: RawPdfTextItem): PdfTextItem | null {
  const text = cleanText(item.str);

  if (!text) {
    return null;
  }

  return {
    text,
    x: Number(item.transform[4] ?? 0),
    y: Number(item.transform[5] ?? 0),
    width: Number(item.width ?? 0),
    height: Number(item.height ?? Math.abs(Number(item.transform[3] ?? 0)) ?? 0),
    fontName: item.fontName,
  };
}

function getLineText(items: PdfTextItem[]) {
  const sortedItems = [...items].sort((left, right) => left.x - right.x);
  let text = "";
  let previousRight = 0;
  let largeGapCount = 0;

  sortedItems.forEach((item, index) => {
    if (index === 0) {
      text = item.text;
      previousRight = item.x + item.width;
      return;
    }

    const gap = item.x - previousRight;
    const meaningfulGap = Math.max(3, item.height * 0.35);

    if (gap > 36) {
      largeGapCount += 1;
      text += "    ";
    } else if (gap > meaningfulGap) {
      text += " ";
    }

    text += item.text;
    previousRight = Math.max(previousRight, item.x + item.width);
  });

  return {
    text: largeGapCount > 0 ? cleanFormattedText(text) : cleanText(text),
    largeGapCount,
  };
}

function groupItemsIntoLines(items: PdfTextItem[]): PdfExtractedLine[] {
  const sortedItems = [...items].sort((left, right) => {
    const yDifference = right.y - left.y;

    if (Math.abs(yDifference) > LINE_Y_TOLERANCE) {
      return yDifference;
    }

    return left.x - right.x;
  });
  const lineGroups: PdfTextItem[][] = [];

  for (const item of sortedItems) {
    const currentLine = lineGroups.at(-1);
    const currentY = currentLine?.[0]?.y;

    if (!currentLine || currentY === undefined || Math.abs(currentY - item.y) > LINE_Y_TOLERANCE) {
      lineGroups.push([item]);
    } else {
      currentLine.push(item);
    }
  }

  return lineGroups
    .map((lineItems) => {
      const sortedLineItems = [...lineItems].sort((left, right) => left.x - right.x);
      const minX = Math.min(...sortedLineItems.map((item) => item.x));
      const maxRight = Math.max(
        ...sortedLineItems.map((item) => item.x + Math.max(item.width, 1))
      );
      const maxHeight = Math.max(...sortedLineItems.map((item) => Math.max(item.height, 1)));
      const { text } = getLineText(sortedLineItems);

      return {
        text,
        x: minX,
        y: sortedLineItems[0]?.y ?? 0,
        width: Math.max(maxRight - minX, 1),
        height: maxHeight,
      };
    })
    .filter((line) => line.text.length > 0);
}

function isListLine(text: string) {
  return /^\s*(?:[-*•]|\d+[.)]|[a-zA-Z][.)])\s+/.test(text);
}

function isTableLikeLine(text: string) {
  return /\S\s{3,}\S/.test(text) || text.split(/\s{2,}/).length >= 3;
}

function uppercaseRatio(text: string) {
  const letters = text.replace(/[^A-Za-z]/g, "");

  if (!letters) {
    return 0;
  }

  const uppercaseLetters = letters.replace(/[^A-Z]/g, "");

  return uppercaseLetters.length / letters.length;
}

function titleLikeRatio(text: string) {
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 2 || words.length > 10) {
    return 0;
  }

  const titleWords = words.filter((word) => /^[A-Z][a-z0-9]+/.test(word));

  return titleWords.length / words.length;
}

function isHeadingLine(line: PdfExtractedLine) {
  const text = line.text.trim();

  if (text.length < 4 || text.length > 90 || /[.!?]$/.test(text) || isListLine(text)) {
    return false;
  }

  return uppercaseRatio(text) >= 0.65 || titleLikeRatio(text) >= 0.65;
}

function classifyParagraph(lines: PdfExtractedLine[]): PdfExtractedParagraph["type"] {
  if (lines.some((line) => isTableLikeLine(line.text))) {
    return "table-like";
  }

  if (lines.every((line) => isListLine(line.text))) {
    return "list";
  }

  if (lines.length === 1 && isHeadingLine(lines[0])) {
    return "heading";
  }

  return "paragraph";
}

function shouldStartNewParagraph(previous: PdfExtractedLine, next: PdfExtractedLine) {
  const verticalGap = previous.y - next.y;
  const paragraphGap = Math.max(previous.height, next.height, 8) * 1.7;

  if (verticalGap > paragraphGap) {
    return true;
  }

  if (isHeadingLine(previous) || isHeadingLine(next)) {
    return true;
  }

  if (isListLine(previous.text) !== isListLine(next.text)) {
    return true;
  }

  if (isTableLikeLine(previous.text) !== isTableLikeLine(next.text)) {
    return true;
  }

  return false;
}

function createParagraph(lines: PdfExtractedLine[]): PdfExtractedParagraph {
  const type = classifyParagraph(lines);
  const text =
    type === "table-like"
      ? lines.map((line) => cleanFormattedText(line.text)).join("\n")
      : cleanText(lines.map((line) => line.text).join(" "));

  return { text, type, lines };
}

function groupLinesIntoParagraphs(lines: PdfExtractedLine[]) {
  const paragraphs: PdfExtractedParagraph[] = [];
  let currentLines: PdfExtractedLine[] = [];

  for (const line of lines) {
    const previousLine = currentLines.at(-1);

    if (previousLine && shouldStartNewParagraph(previousLine, line)) {
      paragraphs.push(createParagraph(currentLines));
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    paragraphs.push(createParagraph(currentLines));
  }

  return paragraphs.filter((paragraph) => paragraph.text.trim().length > 0);
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
      const textItems: PdfTextItem[] = [];

      for (const item of textContent.items) {
        if (isRawTextItem(item)) {
          const positionedItem = toPositionedTextItem(item);

          if (positionedItem) {
            textItems.push(positionedItem);
          }
        }
      }

      const lines = groupItemsIntoLines(textItems);
      const paragraphs = groupLinesIntoParagraphs(lines);

      pages.push({
        pageNumber,
        text: paragraphs.map((paragraph) => paragraph.text).join("\n\n"),
        lines,
        paragraphs,
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
