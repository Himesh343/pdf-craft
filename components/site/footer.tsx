import Link from "next/link";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#050816]/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg border border-white/12 bg-white/8">
            <FileText className="size-4 text-cyan-200" />
          </span>
          <div>
            <p className="font-medium text-white">PDFCraft</p>
            <p>Modern PDF tools for secure document workflows.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="transition hover:text-white" href="/tools">
            Tools
          </Link>
          <Link className="transition hover:text-white" href="/tools/edit-pdf">
            Edit PDF
          </Link>
          <Link className="transition hover:text-white" href="/tools/protect-pdf">
            Protect PDF
          </Link>
          <Link className="transition hover:text-white" href="/tools/unlock-pdf">
            Unlock PDF
          </Link>
          <Link className="transition hover:text-white" href="/tools/pdf-to-word">
            PDF to Word
          </Link>
          <Link className="transition hover:text-white" href="/tools/google-docs">
            Google Docs
          </Link>
          <Link className="transition hover:text-white" href="/#privacy">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
