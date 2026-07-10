import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import type { PdfExtractedPage } from "@/types/pdf";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function createTextParagraph(line: string) {
  return new Paragraph({
    children: [
      new TextRun({
        text: line || " ",
        size: 22,
      }),
    ],
    spacing: { after: 160, line: 320 },
  });
}

export async function createWordDocumentFromPages(
  pages: PdfExtractedPage[]
): Promise<Blob> {
  try {
    const children: Paragraph[] = [
      new Paragraph({
        text: "Converted Document",
        heading: HeadingLevel.TITLE,
        spacing: { after: 320 },
      }),
    ];

    for (const page of pages) {
      children.push(
        new Paragraph({
          text: `Page ${page.pageNumber}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 160 },
        })
      );

      const lines = page.text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        children.push(createTextParagraph("No readable text on this page."));
      } else {
        for (const line of lines) {
          children.push(createTextParagraph(line));
        }
      }
    }

    const document = new Document({
      creator: "PDFCraft",
      title: "Converted Document",
      description: "PDF text converted into an editable Word document.",
      sections: [
        {
          properties: {},
          children,
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              font: "Aptos",
              size: 22,
            },
            paragraph: {
              spacing: { line: 320 },
            },
          },
        },
      },
    });

    const packed = await Packer.toBlob(document);
    const copy = await packed.arrayBuffer();

    return new Blob([copy], { type: DOCX_MIME_TYPE });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Unable to create Word document: ${error.message}`
        : "Unable to create Word document."
    );
  }
}
