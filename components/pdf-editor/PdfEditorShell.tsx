"use client";

import { useMemo, useRef, useState } from "react";
import { FilePenLine } from "lucide-react";

import { EditorPropertiesPanel } from "@/components/pdf-editor/EditorPropertiesPanel";
import { EditorToolbar } from "@/components/pdf-editor/EditorToolbar";
import { PageManagerPanel } from "@/components/pdf-editor/PageManagerPanel";
import { PageNavigation } from "@/components/pdf-editor/PageNavigation";
import { PdfPreviewPanel } from "@/components/pdf-editor/PdfPreviewPanel";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { exportEditedPdf } from "@/lib/pdf/editPdf";
import {
  downloadBlob,
  getEditedPdfFilename,
} from "@/lib/pdf/downloadFile";
import type {
  PdfEditObject,
  PdfEditTool,
  PdfPageState,
  PdfPreviewPageSize,
  PdfProcessingStatus,
} from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

type ExportResult = { blob: Blob; filename: string };

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `edit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createPageStates(totalPages: number): PdfPageState[] {
  return Array.from({ length: totalPages }, (_, index) => ({
    pageNumber: index + 1,
    order: index,
    rotation: 0,
    deleted: false,
  }));
}

function getExportLabel(progress: number) {
  if (progress < 35) {
    return "Preparing PDF...";
  }

  if (progress < 78) {
    return "Applying edits...";
  }

  return "Exporting PDF...";
}

function createObject({
  tool,
  pageNumber,
  x,
  y,
  imageData,
}: {
  tool: PdfEditTool;
  pageNumber: number;
  x: number;
  y: number;
  imageData?: string;
}): PdfEditObject | null {
  const id = createId();
  const base = {
    id,
    pageNumber,
    x: Math.max(0, x - 20),
    y: Math.max(0, y - 16),
  };

  if (tool === "text") {
    return {
      ...base,
      type: "text",
      width: 180,
      height: 44,
      text: "New text",
      fontSize: 18,
      color: "#0f172a",
      bold: false,
    };
  }

  if (tool === "rectangle") {
    return {
      ...base,
      type: "rectangle",
      width: 180,
      height: 96,
      borderColor: "#22d3ee",
      borderWidth: 2,
      fillColor: "#ffffff",
      opacity: 0.08,
    };
  }

  if (tool === "highlight") {
    return {
      ...base,
      type: "highlight",
      width: 180,
      height: 42,
      fillColor: "#fde047",
      opacity: 0.42,
    };
  }

  if (tool === "redact") {
    return { ...base, type: "redact", width: 190, height: 48 };
  }

  if (tool === "removeText") {
    return { ...base, type: "removeText", width: 190, height: 48 };
  }

  if (tool === "signature") {
    return {
      ...base,
      type: "signature",
      width: 220,
      height: 70,
      text: "Signature",
      color: "#0f172a",
      fontSize: 28,
      imageData,
    };
  }

  if (tool === "blur") {
    return { ...base, type: "blur", width: 190, height: 64, opacity: 0.65 };
  }

  return null;
}

export function PdfEditorShell() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageStates, setPageStates] = useState<PdfPageState[]>([]);
  const [previewPageSizes, setPreviewPageSizes] = useState<
    Record<number, PdfPreviewPageSize>
  >({});
  const [activeTool, setActiveTool] = useState<PdfEditTool>("select");
  const [objects, setObjects] = useState<PdfEditObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [status, setStatus] = useState<PdfProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExportResult | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const orderedPages = useMemo(
    () => [...pageStates].sort((left, right) => left.order - right.order),
    [pageStates]
  );
  const visiblePages = useMemo(
    () => orderedPages.filter((page) => !page.deleted).map((page) => page.pageNumber),
    [orderedPages]
  );
  const currentPageState = pageStates.find((page) => page.pageNumber === currentPage);
  const selectedObject = objects.find((object) => object.id === selectedObjectId) ?? null;
  const isExporting = status === "processing";

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const resetEditorState = () => {
    clearProgressTimer();
    setObjects([]);
    setSelectedObjectId(null);
    setPreviewPageSizes({});
    setActiveTool("select");
    setStatus("idle");
    setProgress(0);
    setError("");
    setResult(null);
  };

  const handleFileChange = (nextFile: File | null) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    resetEditorState();
    setFile(nextFile);
    setTotalPages(0);
    setCurrentPage(1);
    setPageStates([]);
    setFileUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  };

  const handleDocumentLoad = (pages: number) => {
    setTotalPages(pages);
    setPageStates(createPageStates(pages));
    setCurrentPage(1);
  };

  const updateObject = (id: string, updates: Partial<PdfEditObject>) => {
    setObjects((current) =>
      current.map((object) =>
        object.id === id ? ({ ...object, ...updates } as PdfEditObject) : object
      )
    );
    setResult(null);
  };

  const addObject = (tool: PdfEditTool, x: number, y: number, imageData?: string) => {
    const nextObject = createObject({ tool, pageNumber: currentPage, x, y, imageData });

    if (!nextObject) {
      return;
    }

    setObjects((current) => [...current, nextObject]);
    setSelectedObjectId(nextObject.id);
    setActiveTool("select");
    setResult(null);
  };

  const deleteSelectedObject = (id: string) => {
    setObjects((current) => current.filter((object) => object.id !== id));
    setSelectedObjectId(null);
    setResult(null);
  };

  const deletePage = (pageNumber: number) => {
    const activePages = pageStates.filter((page) => !page.deleted);

    if (activePages.length <= 1) {
      setError("At least one page must remain in the edited PDF.");
      return;
    }

    setPageStates((current) =>
      current.map((page) =>
        page.pageNumber === pageNumber ? { ...page, deleted: true } : page
      )
    );
    setObjects((current) => current.filter((object) => object.pageNumber !== pageNumber));
    setSelectedObjectId(null);
    setResult(null);
    setError("");

    if (currentPage === pageNumber) {
      const nextPage = activePages.find((page) => page.pageNumber !== pageNumber);
      setCurrentPage(nextPage?.pageNumber ?? 1);
    }
  };

  const rotatePage = (pageNumber: number, direction: "cw" | "ccw" = "cw") => {
    setPageStates((current) =>
      current.map((page) => {
        if (page.pageNumber !== pageNumber) {
          return page;
        }

        const nextRotation =
          direction === "cw" ? (page.rotation + 90) % 360 : (page.rotation + 270) % 360;

        return { ...page, rotation: nextRotation };
      })
    );
    setResult(null);
  };

  const movePage = (pageNumber: number, direction: "up" | "down") => {
    const activePages = [...pageStates]
      .filter((page) => !page.deleted)
      .sort((left, right) => left.order - right.order);
    const index = activePages.findIndex((page) => page.pageNumber === pageNumber);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const targetPage = activePages[targetIndex];
    const current = activePages[index];

    if (!current || !targetPage) {
      return;
    }

    setPageStates((pages) =>
      pages.map((page) => {
        if (page.pageNumber === current.pageNumber) {
          return { ...page, order: targetPage.order };
        }

        if (page.pageNumber === targetPage.pageNumber) {
          return { ...page, order: current.order };
        }

        return page;
      })
    );
    setResult(null);
  };

  const startExportProgress = () => {
    clearProgressTimer();
    setProgress(8);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(current + 9, 92));
    }, 280);
  };

  const exportPdf = async () => {
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    setError("");
    setResult(null);
    setStatus("processing");
    startExportProgress();

    try {
      const blob = await exportEditedPdf({
        file,
        objects,
        pageStates,
        previewPageSizes,
      });
      const filename = getEditedPdfFilename(file.name);

      clearProgressTimer();
      setProgress(100);
      setResult({ blob, filename });
      setStatus("success");
    } catch (caughtError) {
      clearProgressTimer();
      setProgress(0);
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to export edited PDF. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        activeTool={activeTool}
        disabled={!fileUrl}
        onToolChange={(tool) => {
          setActiveTool(tool);
          if (tool === "pages") {
            setSelectedObjectId(null);
          }
        }}
      />

      {error ? (
        <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {isExporting ? <ProgressStatus value={progress} label={getExportLabel(progress)} /> : null}

      {status === "success" && result ? (
        <ResultCard
          title="Edited PDF ready"
          description="Your edited PDF has been generated successfully."
          fileLabel={result.filename}
          actionLabel="Download PDF"
          resetLabel="Continue Editing"
          onDownload={() => downloadBlob(result.blob, result.filename)}
          onReset={() => setStatus("idle")}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="space-y-5 rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
              <FilePenLine className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-white">Document</h2>
              <p className="text-sm text-slate-400">Upload and navigate pages.</p>
            </div>
          </div>

          <FileDropzone
            file={file}
            maxSizeBytes={MAX_PDF_SIZE_BYTES}
            onFileChange={handleFileChange}
          />

          <PageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            visiblePages={visiblePages}
            onPageChange={setCurrentPage}
          />

          {pageStates.length ? (
            <PageManagerPanel
              pageStates={pageStates}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onDeletePage={deletePage}
              onRotatePage={rotatePage}
              onMovePage={movePage}
            />
          ) : null}
        </aside>

        <PdfPreviewPanel
          fileUrl={fileUrl}
          currentPage={currentPage}
          rotation={currentPageState?.rotation ?? 0}
          activeTool={activeTool}
          objects={objects}
          selectedObjectId={selectedObjectId}
          onDocumentLoad={handleDocumentLoad}
          onPageRendered={(pageNumber, size) => {
            setPreviewPageSizes((current) => ({ ...current, [pageNumber]: size }));
          }}
          onAddObject={addObject}
          onSelectObject={setSelectedObjectId}
          onUpdateObject={updateObject}
        />

        <EditorPropertiesPanel
          activeTool={activeTool}
          selectedObject={selectedObject}
          hasPdf={Boolean(file)}
          isExporting={isExporting}
          onUpdateObject={updateObject}
          onDeleteObject={deleteSelectedObject}
          onAddSignatureImage={(imageData) => {
            addObject("signature", 140, 160, imageData);
          }}
          onRotateCurrentPage={() => rotatePage(currentPage, "cw")}
          onDeleteCurrentPage={() => deletePage(currentPage)}
          onResetChanges={() => {
            resetEditorState();
            setPageStates(createPageStates(totalPages));
          }}
          onExport={exportPdf}
        />
      </div>
    </div>
  );
}
