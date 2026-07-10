"use client";

import dynamic from "next/dynamic";

const PdfEditorShell = dynamic(
  () => import("@/components/pdf-editor/PdfEditorShell").then((module) => module.PdfEditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-white/12 bg-white/[0.06] p-6 text-sm text-slate-300">
        Preparing PDF editor...
      </div>
    ),
  }
);

export function PdfEditorClient() {
  return <PdfEditorShell />;
}
