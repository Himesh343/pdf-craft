export type EncryptionStrength = "aes-128" | "aes-256" | "aes-256-metadata";

export interface PdfPermissionOptions {
  allowPrinting: boolean;
  allowCopying: boolean;
  allowAnnotations: boolean;
  allowFormFilling: boolean;
}

export interface EncryptPdfOptions {
  file: File;
  userPassword: string;
  ownerPassword?: string;
  encryption: EncryptionStrength;
  permissions: PdfPermissionOptions;
}

export interface UnlockPdfOptions {
  file: File;
  password: string;
}

export type PdfProcessingStatus =
  | "idle"
  | "validating"
  | "processing"
  | "loading-wasm"
  | "encrypting"
  | "success"
  | "error";

export type PdfEditTool =
  | "select"
  | "text"
  | "rectangle"
  | "highlight"
  | "redact"
  | "removeText"
  | "signature"
  | "blur"
  | "pages";

export interface PdfEditBaseObject {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfTextObject extends PdfEditBaseObject {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  bold: boolean;
}

export interface PdfRectangleObject extends PdfEditBaseObject {
  type: "rectangle";
  borderColor: string;
  borderWidth: number;
  fillColor: string;
  opacity: number;
}

export interface PdfHighlightObject extends PdfEditBaseObject {
  type: "highlight";
  fillColor: string;
  opacity: number;
}

export interface PdfRedactionObject extends PdfEditBaseObject {
  type: "redact";
}

export interface PdfRemoveTextObject extends PdfEditBaseObject {
  type: "removeText";
}

export interface PdfSignatureObject extends PdfEditBaseObject {
  type: "signature";
  text: string;
  color: string;
  fontSize: number;
  imageData?: string;
}

export interface PdfBlurObject extends PdfEditBaseObject {
  type: "blur";
  opacity: number;
}

export type PdfEditObject =
  | PdfTextObject
  | PdfRectangleObject
  | PdfHighlightObject
  | PdfRedactionObject
  | PdfRemoveTextObject
  | PdfSignatureObject
  | PdfBlurObject;

export type PdfPageOperation =
  | { type: "delete"; pageNumber: number }
  | { type: "rotate"; pageNumber: number; rotation: number }
  | { type: "move"; pageNumber: number; order: number };

export interface PdfPageState {
  pageNumber: number;
  order: number;
  rotation: number;
  deleted: boolean;
}

export interface PdfPreviewPageSize {
  width: number;
  height: number;
}

export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

export interface PdfExtractedLine {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfExtractedParagraph {
  text: string;
  type: "heading" | "paragraph" | "list" | "table-like";
  lines: PdfExtractedLine[];
}

export interface PdfExtractedPage {
  pageNumber: number;
  text: string;
  lines: PdfExtractedLine[];
  paragraphs: PdfExtractedParagraph[];
}

export interface PdfConversionQuality {
  totalPages: number;
  extractedPages: number;
  totalCharacters: number;
  detectedHeadings: number;
  detectedParagraphs: number;
  warnings: string[];
}

export type PdfToWordMode =
  | "basic"
  | "preserve-layout"
  | "advanced-editable"
  | "ocr";

export interface PdfVisualConversionSummary {
  totalPages: number;
  pagesRendered: number;
  layoutMode: string;
  editability: string;
  outputQuality: string;
}

export interface PdfToWordResult {
  blob: Blob;
  fileName: string;
  quality?: PdfConversionQuality;
  visualSummary?: PdfVisualConversionSummary;
  mode: PdfToWordMode;
  message: string;
  warnings: string[];
}

export interface PdfToWordOptions {
  file: File;
  mode: PdfToWordMode;
}

export type PdfConversionStatus =
  | "idle"
  | "validating"
  | "reading"
  | "analyzing"
  | "extracting"
  | "rendering"
  | "preserving"
  | "generating"
  | "preparing"
  | "success"
  | "error";
