import type { PdfEditObject, PdfPreviewPageSize } from "@/types/pdf";

export interface PdfPageDimensions {
  width: number;
  height: number;
}

export interface PdfRectCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}

export function overlayRectToPdfRect({
  object,
  previewSize,
  pageSize,
}: {
  object: PdfEditObject;
  previewSize: PdfPreviewPageSize;
  pageSize: PdfPageDimensions;
}): PdfRectCoordinates {
  const scaleX = pageSize.width / previewSize.width;
  const scaleY = pageSize.height / previewSize.height;
  const width = object.width * scaleX;
  const height = object.height * scaleY;
  const x = object.x * scaleX;
  const y = pageSize.height - (object.y * scaleY + height);

  return { x, y, width, height, scaleX, scaleY };
}

export function overlayTextToPdfPoint({
  object,
  previewSize,
  pageSize,
  fontSize,
}: {
  object: PdfEditObject;
  previewSize: PdfPreviewPageSize;
  pageSize: PdfPageDimensions;
  fontSize: number;
}) {
  const scaleX = pageSize.width / previewSize.width;
  const scaleY = pageSize.height / previewSize.height;

  return {
    x: object.x * scaleX,
    y: pageSize.height - object.y * scaleY - fontSize,
    scaleX,
    scaleY,
  };
}
