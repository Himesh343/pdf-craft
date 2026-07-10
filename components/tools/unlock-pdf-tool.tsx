"use client";

import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Info, KeyRound, ShieldCheck, Unlock } from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob, getUnlockedPdfFilename } from "@/lib/pdf/downloadFile";
import { unlockPdfWithPassword } from "@/lib/pdf/unlockPdf";
import type { PdfProcessingStatus } from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

function isPdfFile(file: File | null) {
  if (!file) {
    return false;
  }

  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function validateForm({ file, password }: { file: File | null; password: string }) {
  const errors: string[] = [];

  if (!file) {
    errors.push("Please choose a PDF file.");
  } else if (!isPdfFile(file)) {
    errors.push("Only PDF files are supported.");
  } else if (file.size > MAX_PDF_SIZE_BYTES) {
    errors.push("PDF file size must be 25 MB or less.");
  }

  if (!password.trim()) {
    errors.push("Current PDF password is required.");
  }

  return errors;
}

function getProgressLabel(progress: number) {
  if (progress < 35) {
    return "Reading protected PDF...";
  }

  if (progress < 72) {
    return "Verifying password...";
  }

  return "Generating unlocked copy...";
}

export function UnlockPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<PdfProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
  const progressTimerRef = useRef<number | null>(null);

  const validationErrors = useMemo(
    () => validateForm({ file, password }),
    [file, password]
  );
  const isProcessing = status === "validating" || status === "processing";
  const canSubmit = validationErrors.length === 0 && !isProcessing;

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const resetForm = () => {
    clearProgressTimer();
    setFile(null);
    setPassword("");
    setShowPassword(false);
    setStatus("idle");
    setProgress(0);
    setError("");
    setResult(null);
  };

  const startProgress = () => {
    clearProgressTimer();
    setProgress(8);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(current + 8, 92));
    }, 280);
  };

  const handleSubmit = async () => {
    const errors = validateForm({ file, password });

    if (errors.length > 0 || !file) {
      setError(errors[0] || "Please review the form and try again.");
      return;
    }

    setError("");
    setResult(null);
    setStatus("validating");
    startProgress();

    try {
      setStatus("processing");
      const blob = await unlockPdfWithPassword({ file, password });
      const filename = getUnlockedPdfFilename(file.name);

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
          : "Unable to unlock PDF. Please try again."
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
            setResult(null);
            setError("");
            setStatus("idle");
            setProgress(0);
          }}
        />
      </div>

      <div className="space-y-6 rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-white">Unlock settings</h2>
            <p className="text-sm text-slate-400">
              Enter the current PDF password to create an unlocked copy.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-slate-200">
            Current PDF password
          </Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setResult(null);
                setError("");
              }}
              placeholder="Enter current password"
              className="h-11 border-white/12 bg-[#050816]/60 pr-11 text-white placeholder:text-slate-500"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-300">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>
              You must know the current PDF password. PDFCraft does not recover,
              guess, or bypass unknown passwords.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-4 text-sm text-slate-300">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>
              Use this tool only for PDFs you own or have permission to modify.
              The unlocked copy is generated in your browser.
            </p>
          </div>
        </div>

        {error && status !== "success" ? (
          <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
            <p>{error}</p>
          </div>
        ) : null}

        <Button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="h-11 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white hover:opacity-90"
        >
          <Unlock className="size-4" />
          Unlock PDF
        </Button>

        {isProcessing ? (
          <ProgressStatus value={progress} label={getProgressLabel(progress)} />
        ) : null}

        {status === "success" && result ? (
          <ResultCard
            title="Unlocked PDF ready"
            description="Your unlocked PDF has been generated successfully."
            fileLabel={result.filename}
            actionLabel="Download PDF"
            resetLabel="Unlock Another PDF"
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={resetForm}
          />
        ) : null}
      </div>
    </div>
  );
}
