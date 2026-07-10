import { Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

interface ProgressStatusProps {
  value: number;
  label: string;
}

export function ProgressStatus({ value, label }: ProgressStatusProps) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3 text-sm text-slate-200">
        <Loader2 className="size-4 animate-spin text-cyan-200" />
        <span>{label}</span>
      </div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">Progress</span>
        <span className="tabular-nums text-slate-300">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
