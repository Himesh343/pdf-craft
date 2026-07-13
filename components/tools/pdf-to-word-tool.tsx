"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
  Sparkles,
} from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { convertPdfToWord } from "@/lib/pdf/convertPdfToWord";
import { downloadBlob } from "@/lib/pdf/downloadFile";
import { cn } from "@/lib/utils";
import type {
  PdfConversionQuality,
  PdfConversionStatus,
  PdfToWordMode,
  PdfToWordResult,
  PdfVisualConversionSummary,
} from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
const LARGE_FILE_WARNING_BYTES = 10 * 1024 * 1024;

type ConversionModeStatus = "Available" | "Coming Soon";

interface ConversionModeMetadata {
  id: PdfToWordMode;
  title: string;
  badge: string;
  description: string;
  status: ConversionModeStatus;
  bestFor?: string[];
  limitations?: string[];
}

interface DetailItem {
  label: string;
  value: string | number;
}

const conversionModes: ConversionModeMetadata[] = [
  {
    id: "basic",
    title: "Basic Editable Word",
    badge: "Editable Text",
    description:
      "Extracts readable text from your PDF and creates an editable Word document.",
    status: "Available",
    bestFor: [
      "Reports",
      "Letters",
      "Text-based PDFs",
      "Documents where editing text is more important than exact layout",
    ],
    limitations: [
      "Tables and complex layouts may not match the original PDF perfectly.",
    ],
  },
  {
    id: "preserve-layout",
    title: "Preserve Layout",
    badge: "Best Visual Match",
    description:
      "Keeps the original PDF appearance by placing each page into Word as a high-quality image.",
    status: "Available",
    bestFor: [
      "Designed documents",
      "Tables",
      "Forms",
      "Documents where visual accuracy is more important than text editing",
    ],
    limitations: [
      "Text may not be directly editable because pages are inserted as images.",
      "Output file size may be larger.",
    ],
  },
  {
    id: "advanced-editable",
    title: "Advanced Editable Layout",
    badge: "Coming Soon",
    description:
      "Designed to preserve layout while keeping text, tables, and structure editable.",
    status: "Coming Soon",
  },
  {
    id: "ocr",
    title: "Scanned Document OCR",
    badge: "Coming Soon",
    description:
      "Designed for image-based PDFs that require text recognition before conversion.",
    status: "Coming Soon",
  },
];

const outputComparison = [
  {
    title: "Basic Editable Word",
    details: [
      { label: "Editable text", value: "Yes" },
      { label: "Layout match", value: "Standard" },
      { label: "Best for", value: "Editing content" },
      { label: "File size", value: "Smaller" },
    ],
  },
  {
    title: "Preserve Layout",
    details: [
      { label: "Editable text", value: "Limited" },
      { label: "Layout match", value: "High" },
      { label: "Best for", value: "Keeping original design" },
      { label: "File size", value: "Larger" },
    ],
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
    return "Please upload a PDF file.";
  }

  if (!isPdfFile(file)) {
    return "Please upload a PDF file.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return "File size must be under 25 MB.";
  }

  return "";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return bytes + " B";
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return kilobytes.toFixed(1) + " KB";
  }

  return (kilobytes / 1024).toFixed(1) + " MB";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getModeMetadata(mode: PdfToWordMode) {
  return conversionModes.find((option) => option.id === mode) ?? conversionModes[0];
}

function isAvailableMode(mode: PdfToWordMode) {
  return getModeMetadata(mode).status === "Available";
}

function getModeExplanation(mode: PdfToWordMode) {
  if (mode === "preserve-layout") {
    return "Preserve Layout creates a Word document that closely matches the PDF appearance by embedding each page as an image. Choose this mode when visual accuracy is more important than editing text.";
  }

  return "Basic Editable Word creates editable text output. It is best for text-based PDFs, but complex tables, spacing, and visual design may not perfectly match the original PDF.";
}

function getButtonLabel(mode: PdfToWordMode) {
  if (!isAvailableMode(mode)) {
    return "Coming Soon";
  }

  if (mode === "preserve-layout") {
    return "Convert with Preserved Layout";
  }

  return "Convert to Editable Word";
}

function getStatusLabel(status: PdfConversionStatus, mode: PdfToWordMode) {
  if (status === "reading" || status === "validating") {
    return "Reading PDF...";
  }

  if (mode === "preserve-layout") {
    if (status === "rendering") {
      return "Rendering pages...";
    }

    if (status === "preserving") {
      return "Preserving visual layout...";
    }

    if (status === "generating") {
      return "Building Word document...";
    }

    return "Preparing download...";
  }

  if (status === "analyzing") {
    return "Analyzing text structure...";
  }

  if (status === "extracting") {
    return "Extracting editable content...";
  }

  if (status === "generating") {
    return "Creating Word document...";
  }

  return "Preparing download...";
}

function getModeWarnings(mode: PdfToWordMode, file: File | null) {
  const warnings: string[] = [];

  if (mode === "basic") {
    warnings.push(
      "Some layout details may change because this mode prioritizes editable text."
    );
  }

  if (mode === "preserve-layout") {
    warnings.push(
      "Text may not be directly editable in Preserve Layout mode because each PDF page is inserted as an image."
    );
  }

  if (file && file.size > LARGE_FILE_WARNING_BYTES) {
    warnings.push("Large PDFs may take longer to process and may generate larger Word files.");
  }

  return warnings;
}

function ConversionWarningCard({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
      {warnings.map((warning) => (
        <div key={warning} className="flex gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="leading-6">{warning}</p>
        </div>
      ))}
    </div>
  );
}

function ConversionModeCard({
  option,
  selected,
  onSelect,
}: {
  option: ConversionModeMetadata;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = option.status === "Coming Soon";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "rounded-xl border p-4 text-left transition",
        selected ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/12 bg-[#050816]/50",
        disabled ? "cursor-not-allowed opacity-55" : "hover:border-cyan-300/45 hover:bg-white/8"
      )}
    >
      <span className="flex flex-col gap-4">
        <span className="flex items-start justify-between gap-3">
          <span>
            <span className="block font-semibold text-white">{option.title}</span>
            <span className="mt-1 block text-sm leading-6 text-slate-300">
              {option.description}
            </span>
          </span>
          <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-xs font-medium text-slate-200">
            {option.badge}
          </span>
        </span>

        {option.bestFor ? (
          <span className="grid gap-2 text-sm text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/80">
              Best for
            </span>
            <span className="flex flex-wrap gap-2">
              {option.bestFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </span>
          </span>
        ) : null}

        {option.limitations ? (
          <span className="grid gap-2 text-sm text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Limitations
            </span>
            {option.limitations.map((item) => (
              <span key={item} className="leading-6 text-slate-300">
                {item}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function OutputComparison() {
  return (
    <div className="rounded-xl border border-white/12 bg-[#050816]/50 p-4">
      <h3 className="font-semibold text-white">Choose the right output</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {outputComparison.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/12 bg-white/[0.04] p-4">
            <p className="font-medium text-white">{item.title}</p>
            <div className="mt-3 space-y-2">
              {item.details.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">{detail.label}</span>
                  <span className="text-right font-medium text-slate-100">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileDetailsCard({
  file,
  mode,
}: {
  file: File;
  mode: PdfToWordMode;
}) {
  const details: DetailItem[] = [
    { label: "File name", value: file.name },
    { label: "File size", value: formatFileSize(file.size) },
    { label: "PDF type", value: file.type || "application/pdf" },
    { label: "Max allowed size", value: "25 MB" },
    { label: "Selected conversion mode", value: getModeMetadata(mode).title },
  ];

  return (
    <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
          <FileText className="size-4" />
        </span>
        <div>
          <h3 className="font-semibold text-white">File details</h3>
          <p className="text-sm text-slate-400">Review the selected PDF before conversion.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-white/12 bg-white/[0.04] p-3 text-sm"
          >
            <span className="shrink-0 text-slate-400">{detail.label}</span>
            <span className="min-w-0 truncate text-right font-medium text-white">
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultDetailsCard({
  details,
}: {
  details: DetailItem[];
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
          <CheckCircle2 className="size-4" />
        </span>
        <div>
          <h3 className="font-semibold text-white">Result details</h3>
          <p className="text-sm text-slate-400">What this Word document is optimized for.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="rounded-lg border border-white/12 bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {detail.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableSummaryCard({
  quality,
  warnings,
}: {
  quality: PdfConversionQuality;
  warnings: string[];
}) {
  const summaryItems: DetailItem[] = [
    { label: "Pages converted", value: formatNumber(quality.extractedPages) },
    { label: "Characters extracted", value: formatNumber(quality.totalCharacters) },
    { label: "Paragraphs detected", value: formatNumber(quality.detectedParagraphs) },
    { label: "Headings detected", value: formatNumber(quality.detectedHeadings) },
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
            Text structure detected from the selected PDF.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {summaryItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/12 bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <ConversionWarningCard warnings={warnings} />
      </div>
    </div>
  );
}

function VisualSummaryCard({
  summary,
  warnings,
}: {
  summary: PdfVisualConversionSummary;
  warnings: string[];
}) {
  const summaryItems: DetailItem[] = [
    { label: "Pages rendered", value: formatNumber(summary.pagesRendered) },
    { label: "Layout mode", value: summary.layoutMode },
    { label: "Editability", value: summary.editability },
    { label: "Output quality", value: summary.outputQuality },
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
            Visual layout generated from rendered PDF pages.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {summaryItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/12 bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <ConversionWarningCard warnings={warnings} />
      </div>
    </div>
  );
}

function getResultTitle(result: PdfToWordResult) {
  if (result.mode === "preserve-layout") {
    return "Layout-preserved Word document ready";
  }

  return "Editable Word document ready";
}

function getResultDetails(result: PdfToWordResult): DetailItem[] {
  if (result.mode === "preserve-layout") {
    return [
      { label: "Output type", value: "Visual layout" },
      { label: "Best use", value: "Format preservation" },
      { label: "Editability", value: "Page content inserted as images" },
      { label: "File name", value: result.fileName },
    ];
  }

  return [
    { label: "Output type", value: "Editable text" },
    { label: "Best use", value: "Text editing" },
    { label: "Layout accuracy", value: "Standard" },
    { label: "File name", value: result.fileName },
  ];
}

export function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfToWordMode>("basic");
  const [status, setStatus] = useState<PdfConversionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToWordResult | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const fileError = useMemo(() => validateFile(file), [file]);
  const modeWarnings = useMemo(() => getModeWarnings(mode, file), [file, mode]);
  const isProcessing = [
    "validating",
    "reading",
    "analyzing",
    "extracting",
    "rendering",
    "preserving",
    "generating",
    "preparing",
  ].includes(status);
  const modeError = isAvailableMode(mode) ? "" : "This conversion mode is not available yet.";
  const canConvert = Boolean(file) && !fileError && !modeError && !isProcessing;

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const reset = () => {
    clearProgressTimer();
    setFile(null);
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

        if (next >= 86) {
          setStatus("preparing");
        } else if (next >= 68) {
          setStatus("generating");
        } else if (next >= 48) {
          setStatus(mode === "preserve-layout" ? "preserving" : "extracting");
        } else if (next >= 24) {
          setStatus(mode === "preserve-layout" ? "rendering" : "analyzing");
        } else {
          setStatus("reading");
        }

        return next;
      });
    }, 260);
  };

  const handleConvert = async () => {
    const nextFileError = validateFile(file);
    const nextModeError = isAvailableMode(mode)
      ? ""
      : "This conversion mode is not available yet.";

    if (nextFileError || nextModeError || !file) {
      setError(nextFileError || nextModeError || "Please upload a PDF file.");
      return;
    }

    setError("");
    setResult(null);
    setStatus("validating");
    startProgress();

    try {
      const conversion = await convertPdfToWord({ file, mode });

      clearProgressTimer();
      setProgress(100);
      setStatus("success");
      setResult(conversion);
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
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
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

        {file ? <FileDetailsCard file={file} mode={mode} /> : null}
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
              PDFCraft offers two conversion approaches: editable text conversion for
              content editing, and layout-preserved conversion for visual accuracy.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-200">Conversion mode</Label>
          <div className="grid gap-3">
            {conversionModes.map((option) => (
              <ConversionModeCard
                key={option.id}
                option={option}
                selected={mode === option.id}
                onSelect={() => {
                  setMode(option.id);
                  setError("");
                  setResult(null);
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-300">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>{getModeExplanation(mode)}</p>
          </div>
        </div>

        <OutputComparison />
        <ConversionWarningCard warnings={modeWarnings} />

        {error || (file && fileError) || modeError ? (
          <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
            {error || fileError || modeError}
          </div>
        ) : null}

        <Button
          type="button"
          disabled={!canConvert}
          onClick={handleConvert}
          className="h-11 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white hover:opacity-90"
        >
          <Sparkles className="size-4" />
          {getButtonLabel(mode)}
        </Button>

        {isProcessing ? (
          <ProgressStatus value={progress} label={getStatusLabel(status, mode)} />
        ) : null}

        {status === "success" && result ? (
          <div className="space-y-4">
            <ResultCard
              title={getResultTitle(result)}
              description={result.message}
              fileLabel={result.fileName}
              actionLabel="Download Word Document"
              resetLabel="Convert Another PDF"
              onDownload={() => downloadBlob(result.blob, result.fileName)}
              onReset={reset}
            />
            <ResultDetailsCard details={getResultDetails(result)} />
            {result.quality ? (
              <EditableSummaryCard
                quality={result.quality}
                warnings={result.warnings}
              />
            ) : null}
            {result.visualSummary ? (
              <VisualSummaryCard
                summary={result.visualSummary}
                warnings={result.warnings}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
