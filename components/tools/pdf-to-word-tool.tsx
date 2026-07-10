"use client";

import { useMemo, useRef, useState } from "react";
import { FileText, Info, Sparkles } from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { convertPdfToWord } from "@/lib/pdf/convertPdfToWord";
import {
  downloadBlob,
  getWordDocumentFilename,
} from "@/lib/pdf/downloadFile";
import { cn } from "@/lib/utils";
import type { PdfConversionStatus, PdfToWordOptions } from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

type ConversionMode = PdfToWordOptions["mode"];

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
      "Designed to retain tables, spacing, images, and visual structure.",
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

function getStatusLabel(status: PdfConversionStatus) {
  if (status === "reading" || status === "validating") {
    return "Reading PDF...";
  }

  if (status === "extracting") {
    return "Extracting text...";
  }

  if (status === "generating") {
    return "Creating Word document...";
  }

  return "Preparing download...";
}

export function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConversionMode>("basic");
  const [status, setStatus] = useState<PdfConversionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
  const progressTimerRef = useRef<number | null>(null);

  const fileError = useMemo(() => validateFile(file), [file]);
  const isProcessing = ["validating", "reading", "extracting", "generating"].includes(
    status
  );
  const canConvert = Boolean(file) && !fileError && mode === "basic" && !isProcessing;

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
        const next = Math.min(current + 6, 92);

        if (next >= 72) {
          setStatus("generating");
        } else if (next >= 32) {
          setStatus("extracting");
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
      const blob = await convertPdfToWord(file);
      const filename = getWordDocumentFilename(file.name);

      clearProgressTimer();
      setProgress(100);
      setStatus("success");
      setResult({ blob, filename });
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
              Basic conversion is optimized for text-based PDFs. Complex layouts,
              scanned documents, and advanced formatting may require enhanced
              conversion support.
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
          <ProgressStatus value={progress} label={getStatusLabel(status)} />
        ) : null}

        {status === "success" && result ? (
          <ResultCard
            title="Word document ready"
            description="Your Word document has been generated successfully."
            fileLabel={result.filename}
            actionLabel="Download Word Document"
            resetLabel="Convert Another PDF"
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
          />
        ) : null}
      </div>
    </div>
  );
}
