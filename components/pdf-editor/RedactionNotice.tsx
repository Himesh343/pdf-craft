import { ShieldAlert } from "lucide-react";

export function RedactionNotice() {
  return (
    <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-300">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-cyan-200" />
        <p>
          For sensitive documents, use Redact instead of Remove Text. Redaction
          is intended to hide confidential information before sharing.
        </p>
      </div>
    </div>
  );
}
