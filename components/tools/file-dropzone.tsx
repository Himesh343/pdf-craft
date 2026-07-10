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
          "flex min-h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/18 bg-white/[0.05] p-6 text-center transition hover:border-cyan-300/45 hover:bg-white/[0.08]",
          isDragging && "border-cyan-300/70 bg-cyan-300/10"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <span className="grid size-14 place-items-center rounded-xl border border-white/12 bg-white/8 text-cyan-100">
          <Upload className="size-7" />
        </span>
        <span className="mt-4 text-base font-semibold text-white">
          Drop your PDF here
        </span>
        <span className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
          Drag and drop a PDF file, or click to browse from your device.
        </span>
      </button>

      {file ? (
        <div className="flex flex-col gap-4 rounded-xl border border-white/12 bg-[#050816]/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
              onClick={() => inputRef.current?.click()}
            >
              Change PDF
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:bg-white/10 hover:text-white"
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

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
