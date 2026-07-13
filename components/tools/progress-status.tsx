import { Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

interface ProgressStatusProps {
  value: number;
  label: string;
}

export function ProgressStatus({ value, label }: ProgressStatusProps) {
  return (
    <div className="pc-card rounded-xl p-5">
      <div className="mb-4 flex items-center gap-3 text-sm text-[var(--pc-text-secondary)]">
        <Loader2 className="size-4 animate-spin text-[var(--pc-primary)]" />
        <span>{label}</span>
      </div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--pc-text-secondary)]">Progress</span>
        <span className="tabular-nums text-[var(--pc-text-secondary)]">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
