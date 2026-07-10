"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { EditObjectLayer } from "@/components/pdf-editor/EditObjectLayer";
import { cn } from "@/lib/utils";
import type {
  PdfEditObject,
  PdfEditTool,
  PdfPreviewPageSize,
} from "@/types/pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfPreviewPanelProps {
  fileUrl: string | null;
  currentPage: number;
  rotation: number;
  activeTool: PdfEditTool;
  objects: PdfEditObject[];
  selectedObjectId: string | null;
  onDocumentLoad: (pages: number) => void;
  onPageRendered: (pageNumber: number, size: PdfPreviewPageSize) => void;
  onAddObject: (tool: PdfEditTool, x: number, y: number) => void;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<PdfEditObject>) => void;
}

export function PdfPreviewPanel({
  fileUrl,
  currentPage,
  rotation,
  activeTool,
  objects,
  selectedObjectId,
  onDocumentLoad,
  onPageRendered,
  onAddObject,
  onSelectObject,
  onUpdateObject,
}: PdfPreviewPanelProps) {
  const pageFrameRef = useRef<HTMLDivElement>(null);
  const pageObjects = objects.filter((object) => object.pageNumber === currentPage);

  const handlePreviewPointerDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!fileUrl) {
      return;
    }

    if (activeTool === "select" || activeTool === "pages") {
      onSelectObject(null);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    onAddObject(activeTool, event.clientX - rect.left, event.clientY - rect.top);
  };

  return (
    <div className="flex min-h-[640px] items-center justify-center overflow-auto rounded-xl border border-white/12 bg-[#030611] p-4 shadow-2xl shadow-black/30">
      {fileUrl ? (
        <Document
          file={fileUrl}
          loading={
            <div className="rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-slate-300">
              Preparing PDF...
            </div>
          }
          error={
            <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              Unable to preview this PDF.
            </div>
          }
          onLoadSuccess={(document: { numPages: number }) => {
            onDocumentLoad(document.numPages);
          }}
        >
          <div
            ref={pageFrameRef}
            className={cn(
              "relative overflow-hidden rounded-sm bg-white shadow-2xl shadow-black/45",
              activeTool !== "select" && activeTool !== "pages" && "cursor-crosshair"
            )}
          >
            <Page
              key={`${currentPage}-${rotation}`}
              pageNumber={currentPage}
              width={760}
              rotate={rotation}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={
                <div className="grid h-[520px] w-[760px] place-items-center bg-white text-sm text-slate-500">
                  Preparing page...
                </div>
              }
              onRenderSuccess={() => {
                const canvas = pageFrameRef.current?.querySelector("canvas");
                const bounds = canvas?.getBoundingClientRect();

                if (bounds) {
                  onPageRendered(currentPage, {
                    width: bounds.width,
                    height: bounds.height,
                  });
                }
              }}
            />
            <div
              className={cn(
                "absolute inset-0 z-10",
                activeTool !== "select" && activeTool !== "pages" && "cursor-crosshair"
              )}
              onMouseDown={handlePreviewPointerDown}
            />
            <EditObjectLayer
              objects={pageObjects}
              selectedObjectId={selectedObjectId}
              onSelect={onSelectObject}
              onUpdate={onUpdateObject}
            />
          </div>
        </Document>
      ) : (
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-xl border border-white/12 bg-white/8 text-cyan-100">
            PDF
          </div>
          <h2 className="mt-5 text-lg font-semibold text-white">Upload a PDF to begin</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Your document preview and editable objects will appear here after you choose a PDF.
          </p>
        </div>
      )}
    </div>
  );
}
