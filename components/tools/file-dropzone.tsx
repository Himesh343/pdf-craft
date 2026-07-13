"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  maxSizeBytes?: number;
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

export function FileDropzone({
  file,
  onFileChange,
  maxSizeBytes = 25 * 1024 * 1024,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const selectFile = (candidate?: File) => {
    setError("");

    if (!candidate) {
      return;
    }

    const isPdf =
      candidate.type === "application/pdf" ||
      candidate.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please choose a PDF file.");
      return;
    }

    if (candidate.size > maxSizeBytes) {
      setError(`PDF file size must be ${formatFileSize(maxSizeBytes)} or less.`);
      return;
    }

    onFileChange(candidate);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex min-h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--pc-border)] bg-[rgba(15,23,42,0.46)] p-6 text-center shadow-inner shadow-black/20 backdrop-blur-xl transition hover:border-[var(--pc-border-active)] hover:bg-[var(--pc-card-hover)]",
          isDragging &&
            "border-[var(--pc-border-active)] bg-[var(--pc-primary-soft)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <span className="pc-icon-box grid size-14 place-items-center rounded-xl">
          <Upload className="size-7" />
        </span>
        <span className="mt-4 text-base font-semibold text-[var(--pc-text)]">
          Drop your PDF here
        </span>
        <span className="mt-2 max-w-sm text-sm leading-6 text-[var(--pc-text-secondary)]">
          Drag and drop a PDF file, or click to browse from your device.
        </span>
      </button>

      {file ? (
        <div className="pc-card-soft flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="pc-icon-box grid size-10 shrink-0 place-items-center rounded-lg">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--pc-text)]">{file.name}</p>
              <p className="text-xs text-[var(--pc-text-muted)]">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="pc-secondary-button border-[var(--pc-border)] bg-transparent text-[var(--pc-text-secondary)] hover:text-[var(--pc-text)]"
              onClick={() => inputRef.current?.click()}
            >
              Change PDF
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-[var(--pc-text-muted)] hover:bg-[var(--pc-card-hover)] hover:text-[var(--pc-text)]"
              onClick={() => {
                onFileChange(null);
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
              aria-label="Remove selected file"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
