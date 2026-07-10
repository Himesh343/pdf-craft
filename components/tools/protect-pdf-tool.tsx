"use client";

import { useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob, getProtectedPdfFilename } from "@/lib/pdf/downloadFile";
import { encryptPdfWithPassword } from "@/lib/pdf/encryptPdf";
import { cn } from "@/lib/utils";
import type {
  EncryptionStrength,
  PdfPermissionOptions,
  PdfProcessingStatus,
} from "@/types/pdf";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

const strengths: Array<{
  label: string;
  value: EncryptionStrength;
  summary: string;
}> = [
  { label: "AES-128", value: "aes-128", summary: "AES-128" },
  {
    label: "AES-256 Recommended",
    value: "aes-256",
    summary: "AES-256",
  },
  {
    label: "AES-256 with metadata",
    value: "aes-256-metadata",
    summary: "AES-256",
  },
];

const permissionOptions: Array<{
  key: keyof PdfPermissionOptions;
  label: string;
}> = [
  { key: "allowPrinting", label: "Allow printing" },
  { key: "allowCopying", label: "Allow copying text" },
  { key: "allowAnnotations", label: "Allow annotations" },
  { key: "allowFormFilling", label: "Allow form filling" },
];

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
    return { score: 0, label: "Password strength", color: "bg-white/12" };
  }

  if (score <= 2) {
    return { score, label: "Weak", color: "bg-rose-400" };
  }

  if (score <= 4) {
    return { score, label: "Good", color: "bg-cyan-300" };
  }

  return { score, label: "Strong", color: "bg-emerald-300" };
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
    errors.push("Password must be at least 8 characters.");
  }

  if (!confirmPassword) {
    errors.push("Confirm password is required.");
  } else if (password !== confirmPassword) {
    errors.push("Password and confirm password must match.");
  }

  return errors;
}

export function ProtectPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [encryption, setEncryption] = useState<EncryptionStrength>("aes-256");
  const [permissions, setPermissions] = useState<PdfPermissionOptions>({
    allowPrinting: true,
    allowCopying: false,
    allowAnnotations: true,
    allowFormFilling: true,
  });
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
  const selectedStrength = strengths.find((item) => item.value === encryption);
  const isProcessing = status === "loading-wasm" || status === "encrypting";
  const canSubmit = validationErrors.length === 0 && !isProcessing;
  const passwordMessage =
    password && password.length < 8
      ? "Password must be at least 8 characters."
      : "Minimum 8 characters.";
  const confirmPasswordMessage =
    confirmPassword && password !== confirmPassword
      ? "Password and confirm password must match."
      : "";

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
    setOwnerPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowOwnerPassword(false);
    setEncryption("aes-256");
    setPermissions({
      allowPrinting: true,
      allowCopying: false,
      allowAnnotations: true,
      allowFormFilling: true,
    });
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
      const blob = await encryptPdfWithPassword({
        file,
        userPassword: password,
        ownerPassword: ownerPassword.trim() || undefined,
        encryption,
        permissions,
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

  const updatePermission = (key: keyof PdfPermissionOptions, checked: boolean) => {
    setPermissions((current) => ({ ...current, [key]: checked }));
    setResult(null);
    setError("");
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
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
              <LockKeyhole className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-white">Protection settings</h2>
              <p className="text-sm text-slate-400">
                Configure password, encryption strength, and document permissions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
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
                placeholder="Enter password"
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
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full",
                      index < passwordStrength.score
                        ? passwordStrength.color
                        : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>{passwordStrength.label}</span>
                <span>{passwordMessage}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-200">
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
                placeholder="Confirm password"
                className="h-11 border-white/12 bg-[#050816]/60 pr-11 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {confirmPasswordMessage ? (
              <p className="text-sm text-rose-300">{confirmPasswordMessage}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner-password" className="text-slate-200">
            Owner password <span className="text-slate-500">(optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="owner-password"
              type={showOwnerPassword ? "text" : "password"}
              value={ownerPassword}
              onChange={(event) => {
                setOwnerPassword(event.target.value);
                setResult(null);
                setError("");
              }}
              placeholder="Enter owner password"
              className="h-11 border-white/12 bg-[#050816]/60 pr-11 text-white placeholder:text-slate-500"
            />
            <button
              type="button"
              aria-label={showOwnerPassword ? "Hide owner password" : "Show owner password"}
              onClick={() => setShowOwnerPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
            >
              {showOwnerPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-200">Encryption strength</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {strengths.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setEncryption(item.value);
                  setResult(null);
                  setError("");
                }}
                className={cn(
                  "min-h-12 rounded-lg border px-3 text-sm font-medium text-slate-300 transition hover:border-cyan-300/45 hover:bg-white/8",
                  encryption === item.value
                    ? "border-cyan-300/50 bg-cyan-300/10 text-white"
                    : "border-white/12 bg-[#050816]/50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-200">Permissions</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {permissionOptions.map((permission) => (
              <label
                key={permission.key}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-white/12 bg-[#050816]/50 px-3 text-sm text-slate-200"
              >
                <Checkbox
                  checked={permissions[permission.key]}
                  onCheckedChange={(checked) => {
                    updatePermission(permission.key, Boolean(checked));
                  }}
                  className="border-white/25 data-checked:border-cyan-300 data-checked:bg-cyan-400 data-checked:text-[#050816]"
                />
                {permission.label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-4 text-sm text-slate-300">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>
              Protection summary: {selectedStrength?.summary ?? "AES-256"} encryption
              with selected document permissions.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-300">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>
              PDF permissions are respected by compatible PDF readers. Password
              protection is required to restrict access to the file.
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
          <LockKeyhole className="size-4" />
          Generate Protected PDF
        </Button>

        {isProcessing ? (
          <ProgressStatus
            value={progress}
            label="Encrypting your PDF..."
          />
        ) : null}

        {status === "success" && result ? (
          <ResultCard
            title="Protected PDF ready"
            description="Your password-protected PDF has been generated successfully."
            fileLabel={result.filename}
            actionLabel="Download PDF"
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={resetForm}
          />
        ) : null}
      </div>
    </div>
  );
}
