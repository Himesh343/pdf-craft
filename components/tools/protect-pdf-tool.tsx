"use client";

import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob, getProtectedPdfFilename } from "@/lib/pdf/downloadFile";
import { encryptPdfWithPassword } from "@/lib/pdf/encryptPdf";
import { cn } from "@/lib/utils";
import type { PdfPermissionOptions, PdfProcessingStatus } from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
const DEFAULT_PERMISSIONS: PdfPermissionOptions = {
  allowPrinting: true,
  allowCopying: true,
  allowAnnotations: true,
  allowFormFilling: true,
};

function isPdfFile(file: File | null) {
  if (!file) {
    return false;
  }

  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return { score: 0, label: "Password strength", color: "bg-[var(--pc-border)]" };
  }

  if (score <= 2) {
    return { score, label: "Weak", color: "bg-[var(--pc-danger)]" };
  }

  if (score <= 4) {
    return { score, label: "Good", color: "bg-[var(--pc-primary)]" };
  }

  return { score, label: "Strong", color: "bg-[var(--pc-success)]" };
}

function validateForm({
  file,
  password,
  confirmPassword,
}: {
  file: File | null;
  password: string;
  confirmPassword: string;
}) {
  const errors: string[] = [];

  if (!file) {
    errors.push("Please choose a PDF file.");
  } else if (!isPdfFile(file)) {
    errors.push("Only PDF files are supported.");
  } else if (file.size > MAX_PDF_SIZE_BYTES) {
    errors.push("PDF file size must be 25 MB or less.");
  }

  if (!password) {
    errors.push("Password is required.");
  } else if (password.length < 8) {
    errors.push("Minimum password length should be 8 characters.");
  }

  if (!confirmPassword) {
    errors.push("Confirm password is required.");
  } else if (password !== confirmPassword) {
    errors.push("Passwords must match.");
  }

  return errors;
}

function getProgressLabel(progress: number) {
  if (progress < 28) {
    return "Preparing your PDF...";
  }

  if (progress < 56) {
    return "Applying password protection...";
  }

  if (progress < 86) {
    return "Encrypting PDF...";
  }

  return "Preparing download...";
}

export function ProtectPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<PdfProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
  const progressTimerRef = useRef<number | null>(null);

  const validationErrors = useMemo(
    () => validateForm({ file, password, confirmPassword }),
    [file, password, confirmPassword]
  );
  const passwordStrength = getPasswordStrength(password);
  const isProcessing = status === "loading-wasm" || status === "encrypting";
  const canSubmit = validationErrors.length === 0 && !isProcessing;
  const passwordMessage =
    password && password.length < 8
      ? "Minimum password length should be 8 characters."
      : "Minimum 8 characters.";
  const confirmPasswordMessage =
    confirmPassword && password !== confirmPassword ? "Passwords must match." : "";

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
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStatus("idle");
    setProgress(0);
    setError("");
    setResult(null);
  };

  const startProgress = () => {
    clearProgressTimer();
    setProgress(12);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(current + 7, 88));
    }, 300);
  };

  const handleSubmit = async () => {
    const errors = validateForm({ file, password, confirmPassword });

    if (errors.length > 0 || !file) {
      setError(errors[0] || "Please review the form and try again.");
      return;
    }

    setError("");
    setResult(null);
    setStatus("encrypting");
    startProgress();

    try {
      // Public launch uses simplified password protection: AES-256 is applied
      // with all permissions allowed, while QPDF generates the internal owner
      // password when one is not supplied. The owner password is never shown.
      const blob = await encryptPdfWithPassword({
        file,
        userPassword: password,
        encryption: "aes-256",
        permissions: DEFAULT_PERMISSIONS,
      });
      const filename = getProtectedPdfFilename(file.name);

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
          : "Encryption failed. Please try again."
      );
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="pc-card rounded-xl p-5 sm:p-6">
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

      <div className="space-y-6 pc-card rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg pc-icon-box">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--pc-text)]">Set a password</h2>
            <p className="text-sm text-[var(--pc-text-muted)]">
              Choose a strong password that will be required to open this PDF.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[var(--pc-text-secondary)]">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setResult(null);
                  setError("");
                }}
                placeholder="Type password"
                className="h-11 border-[var(--pc-border)] bg-[rgba(15,23,42,0.52)] backdrop-blur-xl pr-11 text-[var(--pc-text)] placeholder:text-[var(--pc-text-muted)]"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-muted)] transition hover:text-[var(--pc-text)]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full",
                      index < passwordStrength.score
                        ? passwordStrength.color
                        : "bg-[var(--pc-border-soft)]"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-[var(--pc-text-muted)]">
                <span>{passwordStrength.label}</span>
                <span>{passwordMessage}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-[var(--pc-text-secondary)]">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setResult(null);
                  setError("");
                }}
                placeholder="Repeat password"
                className="h-11 border-[var(--pc-border)] bg-[rgba(15,23,42,0.52)] backdrop-blur-xl pr-11 text-[var(--pc-text)] placeholder:text-[var(--pc-text-muted)]"
              />
              <button
                type="button"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pc-text-muted)] transition hover:text-[var(--pc-text)]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {confirmPasswordMessage ? (
              <p className="text-sm text-red-300">{confirmPasswordMessage}</p>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-6 text-[var(--pc-text-muted)]">
          Your password will be required to open this PDF.
        </p>

        {error && status !== "success" ? (
          <div className="pc-danger-box rounded-xl p-4 text-sm text-red-100">
            <p>{error}</p>
          </div>
        ) : null}

        <Button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="pc-primary-button h-11 w-full hover:opacity-100"
        >
          <ShieldCheck className="size-4" />
          Protect PDF
        </Button>

        {isProcessing ? (
          <ProgressStatus value={progress} label={getProgressLabel(progress)} />
        ) : null}

        {status === "success" && result ? (
          <ResultCard
            title="Protected PDF ready"
            description="Your password-protected PDF has been generated successfully."
            fileLabel={result.filename}
            actionLabel="Download PDF"
            resetLabel="Protect Another PDF"
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={resetForm}
          />
        ) : null}
      </div>
    </div>
  );
}
