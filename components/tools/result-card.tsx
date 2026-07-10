import { CheckCircle2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ResultCardProps {
  title: string;
  description: string;
  fileLabel: string;
  actionLabel?: string;
  onDownload?: () => void;
  onReset?: () => void;
  resetLabel?: string;
}

export function ResultCard({
  title,
  description,
  fileLabel,
  actionLabel = "Download",
  onDownload,
  onReset,
  resetLabel = "Protect Another PDF",
}: ResultCardProps) {
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-cyan-300/15 text-cyan-100">
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">
              {fileLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {onDownload ? (
            <Button
              type="button"
              className="h-10 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 px-4 text-white hover:opacity-90"
              onClick={onDownload}
            >
              <Download className="size-4" />
              {actionLabel}
            </Button>
          ) : null}
          {onReset ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 border-white/12 bg-white/8 px-4 text-slate-200 hover:bg-white/12 hover:text-white"
              onClick={onReset}
            >
              {resetLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
