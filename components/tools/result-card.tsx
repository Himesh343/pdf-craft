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
    <div className="pc-success-box rounded-xl p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--pc-success-soft)] text-[var(--pc-success)]">
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--pc-text)]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--pc-text-secondary)]">{description}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">
              {fileLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {onDownload ? (
            <Button
              type="button"
              className="pc-primary-button h-10 px-4 hover:opacity-100"
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
              className="pc-secondary-button h-10 px-4"
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
