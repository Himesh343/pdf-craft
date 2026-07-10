"use client";

import { useState } from "react";
import { FileText, Wand2 } from "lucide-react";

import { FileDropzone } from "@/components/tools/file-dropzone";
import { ProgressStatus } from "@/components/tools/progress-status";
import { ResultCard } from "@/components/tools/result-card";
import { useDocumentProgress } from "@/components/tools/use-document-progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const conversionModes = [
  {
    id: "editable",
    title: "Editable Word",
    description: "Best for text-based PDFs where editable content is the priority.",
  },
  {
    id: "layout",
    title: "Preserve Layout",
    description: "Best for PDFs with tables, forms, spacing, and visual structure.",
  },
  {
    id: "ocr",
    title: "Scanned Document OCR",
    description:
      "For image-based PDFs that require text recognition before conversion.",
  },
] as const;

export function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<(typeof conversionModes)[number]["id"]>(
    "editable"
  );
  const progress = useDocumentProgress();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
        <FileDropzone
          file={file}
          onFileChange={(nextFile) => {
            setFile(nextFile);
            progress.reset();
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
              Choose the conversion mode that best matches your document type.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-200">Conversion mode</Label>
          <div className="grid gap-3">
            {conversionModes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setMode(option.id);
                  progress.reset();
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition hover:border-cyan-300/45 hover:bg-white/8",
                  mode === option.id
                    ? "border-cyan-300/50 bg-cyan-300/10"
                    : "border-white/12 bg-[#050816]/50"
                )}
              >
                <span className="block font-semibold text-white">
                  {option.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-300">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/12 bg-[#050816]/60 p-4 text-sm text-slate-300">
          <div className="flex gap-3">
            <Wand2 className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p>
              PDF to Word conversion will be connected in the next implementation
              phase. The current screen prepares the complete upload and settings
              workflow.
            </p>
          </div>
        </div>

        <Button
          type="button"
          disabled={!file || progress.isProcessing}
          onClick={progress.start}
          className="h-11 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white hover:opacity-90"
        >
          <FileText className="size-4" />
          Prepare Word Conversion
        </Button>

        {progress.isProcessing ? (
          <ProgressStatus
            value={progress.progress}
            label="Preparing Word conversion..."
          />
        ) : null}

        {progress.isComplete && file ? (
          <ResultCard
            title="Word conversion prepared"
            description="Your document workflow is ready for the next step."
            fileLabel={file.name.replace(/.pdf$/i, "") + ".docx"}
          />
        ) : null}
      </div>
    </div>
  );
}
