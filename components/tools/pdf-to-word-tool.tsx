"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, FileText, Info, Sparkles } from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { convertPdfToWord } from "@/lib/pdf/convertPdfToWord";
import {
  downloadBlob,
  getLayoutWordDocumentFilename,
  getWordDocumentFilename,
} from "@/lib/pdf/downloadFile";
import { cn } from "@/lib/utils";
import type {
  PdfLayoutConversionSummary,
  PdfConversionQuality,
  PdfConversionStatus,
  PdfToWordOptions,
} from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

type ConversionMode = PdfToWordOptions["mode"];

type ConversionResult = {
  blob: Blob;
  filename: string;
  quality?: PdfConversionQuality;
  layoutSummary?: PdfLayoutConversionSummary;
  message: string;
};

const conversionModes: Array<{
  id: ConversionMode;
  title: string;
  description: string;
  status: "Available" | "Coming Soon";
}> = [
  {
    id: "basic",
    title: "Basic Editable Word",
    description:
      "Extracts readable text from your PDF and creates an editable Word document.",
    status: "Available",
  },
  {
    id: "preserve-layout",
    title: "Preserve Layout",
    description:
      "Keeps the original PDF appearance by placing each page into Word as a high-quality image.",
    status: "Available",
  },
  {
    id: "advanced-editable",
    title: "Advanced Editable Layout",
    description:
      "Designed to preserve layout while keeping text, tables, and structure editable.",
    status: "Coming Soon",
  },
  {
    id: "ocr",
    title: "Scanned Document OCR",
    description:
      "Designed for image-based PDFs that require text recognition before conversion.",
    status: "Coming Soon",
  },
];

function isPdfFile(file: File | null) {
  if (!file) {
    return false;
  }

  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function validateFile(file: File | null) {
  if (!file) {
    return "Please choose a PDF file.";
  }

  if (!isPdfFile(file)) {
    return "Only PDF files are supported.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return "PDF file size must be 25 MB or less.";
  }

  return "";
}

function getStatusLabel(status: PdfConversionStatus, mode: ConversionMode) {
  if (status === "reading" || status === "validating") {
    return "Reading PDF...";
  }

  if (status === "rendering") {
    return "Rendering pages...";
  }

  if (status === "extracting") {
    return "Extracting formatted text...";
  }

  if (status === "generating") {
    return mode === "preserve-layout"
      ? "Building Word document..."
      : "Creating Word document...";
  }

  return "Preparing download...";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function ConversionSummaryCard({ quality }: { quality: PdfConversionQuality }) {
  const summaryItems = [
    { label: "Pages converted", value: quality.extractedPages },
    { label: "Paragraphs detected", value: quality.detectedParagraphs },
    { label: "Headings detected", value: quality.detectedHeadings },
    { label: "Text characters extracted", value: quality.totalCharacters },
  ];

  return (
    <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
          <Info className="size-4" />
        </span>
        <div>
          <h3 className="font-semibold text-white">Conversion summary</h3>
          <p className="text-sm text-slate-400">
            Structure detected from the PDF text extraction.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/12 bg-white/[0.04] p-3"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatNumber(item.value)}
            </p>
          </div>
        ))}
      </div>

      {quality.warnings.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
          {quality.warnings.map((warning) => (
            <div key={warning} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{warning}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LayoutSummaryCard({ summary }: { summary: PdfLayoutConversionSummary }) {
  const summaryItems = [
    { label: "Pages rendered", value: formatNumber(summary.pagesRendered) },
    { label: "Layout mode", value: summary.layoutMode },
    { label: "Editability", value: summary.editability },
  ];

  return (
    <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
          <Info className="size-4" />
        </span>
        <div>
          <h3 className="font-semibold text-white">Layout summary</h3>
          <p className="text-sm text-slate-400">
            Each PDF page was rendered into the Word document.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/12 bg-white/[0.04] p-3"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConversionMode>("basic");
  const [status, setStatus] = useState<PdfConversionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const fileError = useMemo(() => validateFile(file), [file]);
  const isProcessing = [
    "validating",
    "reading",
    "extracting",
    "rendering",
    "generating",
  ].includes(status);
  const isAvailableMode = mode === "basic" || mode === "preserve-layout";
  const canConvert = Boolean(file) && !fileError && isAvailableMode && !isProcessing;

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const reset = () => {
    clearProgressTimer();
    setFile(null);
    setMode("basic");
    setStatus("idle");
    setProgress(0);
    setError("");
    setResult(null);
  };

  const startProgress = () => {
    clearProgressTimer();
    setProgress(8);

    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 5, 92);

        if (next >= 84) {
          setStatus("generating");
        } else if (next >= 66) {
          setStatus("generating");
        } else if (next >= 42) {
          setStatus(mode === "preserve-layout" ? "rendering" : "extracting");
        } else {
          setStatus("reading");
        }

        return next;
      });
    }, 260);
  };

  const handleConvert = async () => {
    const nextError = validateFile(file);

    if (nextError || !file) {
      setError(nextError || "Please choose a PDF file.");
      return;
    }

    setError("");
    setResult(null);
    setStatus("validating");
    startProgress();

    try {
      const conversion = await convertPdfToWord({ file, mode });
      const filename =
        mode === "preserve-layout"
          ? getLayoutWordDocumentFilename(file.name)
          : getWordDocumentFilename(file.name);

      clearProgressTimer();
      setProgress(100);
      setStatus("success");
      setResult({ ...conversion, filename });
    } catch (caughtError) {
      clearProgressTimer();
      setProgress(0);
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to convert PDF to Word. Please try again."
      );
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
        <FileDropzone
          file={file}
          maxSizeBytes={MAX_PDF_SIZE_BYTES}
          onFileChange={(nextFile) => {
            setFile(nextFile);
            setStatus("idle");
            setProgress(0);
            setError("");
            setResult(null);
          }}
        />
      </div>

      <div className="space-y-6 rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
            <FileText className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-white">Conversion settings</h2>
            <p className="text-sm text-slate-400">
              Choose how PDFCraft should create your Word document.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-300">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>
              {mode === "preserve-layout"
                ? "Preserve Layout creates a Word document that closely matches the PDF appearance by embedding each page as an image. Use Basic Editable Word when editable text is more important."
                : "Basic conversion is optimized for text-based PDFs. Complex layouts, scanned documents, and advanced formatting may require enhanced conversion support."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-200">Conversion mode</Label>
          <div className="grid gap-3">
            {conversionModes.map((option) => {
              const disabled = option.status === "Coming Soon";
              const selected = mode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setMode(option.id);
                    setError("");
                    setResult(null);
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    selected
                      ? "border-cyan-300/50 bg-cyan-300/10"
                      : "border-white/12 bg-[#050816]/50",
                    disabled
                      ? "cursor-not-allowed opacity-55"
                      : "hover:border-cyan-300/45 hover:bg-white/8"
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-white">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-300">
                        {option.description}
                      </span>
                      <span className="mt-2 block text-xs font-medium uppercase tracking-[0.14em] text-cyan-100/80">
                        {option.id === "basic"
                          ? "Editable output"
                          : option.id === "preserve-layout"
                            ? "Best visual match"
                            : "Enhanced conversion"}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-xs font-medium text-slate-200">
                      {option.status}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          disabled={!canConvert}
          onClick={handleConvert}
          className="h-11 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white hover:opacity-90"
        >
          <Sparkles className="size-4" />
          Convert to Word
        </Button>

        {isProcessing ? (
          <ProgressStatus value={progress} label={getStatusLabel(status, mode)} />
        ) : null}

        {status === "success" && result ? (
          <div className="space-y-4">
            <ResultCard
              title="Word document ready"
              description={result.message}
              fileLabel={result.filename}
              actionLabel="Download Word Document"
              resetLabel="Convert Another PDF"
              onDownload={() => downloadBlob(result.blob, result.filename)}
              onReset={reset}
            />
            {result.quality ? (
              <ConversionSummaryCard quality={result.quality} />
            ) : null}
            {result.layoutSummary ? (
              <LayoutSummaryCard summary={result.layoutSummary} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
