import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFPage,
} from "pdf-lib";

import {
  overlayRectToPdfRect,
  overlayTextToPdfPoint,
  type PdfPageDimensions,
} from "@/lib/pdf/pdfCoordinates";
import type {
  PdfEditObject,
  PdfPageState,
  PdfPreviewPageSize,
} from "@/types/pdf";

interface ExportEditedPdfOptions {
  file: File;
  objects: PdfEditObject[];
  pageStates: PdfPageState[];
  previewPageSizes: Record<number, PdfPreviewPageSize>;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized,
    16
  );

  if (Number.isNaN(value)) {
    return rgb(1, 1, 1);
  }

  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  );
}

function getPreviewSize(
  pageNumber: number,
  pageSize: PdfPageDimensions,
  previewPageSizes: Record<number, PdfPreviewPageSize>
) {
  return previewPageSizes[pageNumber] ?? pageSize;
}

async function drawEditObject({
  pdfDoc,
  page,
  object,
  previewSize,
}: {
  pdfDoc: PDFDocument;
  page: PDFPage;
  object: PdfEditObject;
  previewSize: PdfPreviewPageSize;
}) {
  const pageSize = page.getSize();
  const rect = overlayRectToPdfRect({ object, previewSize, pageSize });

  if (object.type === "text") {
    const font = await pdfDoc.embedFont(
      object.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica
    );
    const fontSize = object.fontSize * rect.scaleY;
    const point = overlayTextToPdfPoint({
      object,
      previewSize,
      pageSize,
      fontSize,
    });

    page.drawText(object.text || "Text", {
      x: point.x,
      y: point.y,
      size: fontSize,
      font,
      color: hexToRgb(object.color),
      maxWidth: rect.width,
    });
    return;
  }

  if (object.type === "signature") {
    if (object.imageData) {
      const png = await pdfDoc.embedPng(object.imageData);
      page.drawImage(png, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
      return;
    }

    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const fontSize = object.fontSize * rect.scaleY;
    const point = overlayTextToPdfPoint({
      object,
      previewSize,
      pageSize,
      fontSize,
    });

    page.drawText(object.text || "Signature", {
      x: point.x,
      y: point.y,
      size: fontSize,
      font,
      color: hexToRgb(object.color),
      maxWidth: rect.width,
    });
    return;
  }

  if (object.type === "rectangle") {
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      borderColor: hexToRgb(object.borderColor),
      borderWidth: object.borderWidth * rect.scaleX,
      color: hexToRgb(object.fillColor),
      opacity: object.opacity,
      borderOpacity: Math.min(1, object.opacity + 0.2),
    });
    return;
  }

  if (object.type === "highlight") {
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      color: hexToRgb(object.fillColor),
      opacity: object.opacity,
    });
    return;
  }

  if (object.type === "redact") {
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      color: rgb(0, 0, 0),
      opacity: 1,
    });
    return;
  }

  if (object.type === "removeText") {
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      color: rgb(1, 1, 1),
      opacity: 1,
    });
    return;
  }

  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    color: rgb(0.87, 0.94, 1),
    opacity: object.opacity,
    borderColor: rgb(0.45, 0.85, 1),
    borderOpacity: 0.5,
    borderWidth: 1,
  });
}

export async function exportEditedPdf({
  file,
  objects,
  pageStates,
  previewPageSizes,
}: ExportEditedPdfOptions): Promise<Blob> {
  if (!file) {
    throw new Error("Please choose a PDF file.");
  }

  const sourceBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(sourceBytes);
  const outputPdf = await PDFDocument.create();
  const orderedPages = pageStates
    .filter((page) => !page.deleted)
    .sort((left, right) => left.order - right.order);

  if (orderedPages.length === 0) {
    throw new Error("At least one page must remain in the edited PDF.");
  }

  const copiedPages = await outputPdf.copyPages(
    sourcePdf,
    orderedPages.map((page) => page.pageNumber - 1)
  );

  orderedPages.forEach((pageState, index) => {
    const page = copiedPages[index];
    page.setRotation(degrees(pageState.rotation));
    outputPdf.addPage(page);
  });

  for (let index = 0; index < orderedPages.length; index += 1) {
    const pageState = orderedPages[index];
    const page = outputPdf.getPage(index);
    const pageSize = page.getSize();
    const previewSize = getPreviewSize(
      pageState.pageNumber,
      pageSize,
      previewPageSizes
    );
    const pageObjects = objects.filter(
      (object) => object.pageNumber === pageState.pageNumber
    );

    for (const object of pageObjects) {
      await drawEditObject({ pdfDoc: outputPdf, page, object, previewSize });
    }
  }

  const editedBytes = await outputPdf.save();
  const outputCopy = new Uint8Array(editedBytes.byteLength);
  outputCopy.set(editedBytes);

  return new Blob([outputCopy.buffer], { type: "application/pdf" });
}
