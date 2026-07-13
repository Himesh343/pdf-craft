import Link from "next/link";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--pc-border-soft)] bg-[rgba(5,7,13,0.62)] shadow-[0_-20px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-[var(--pc-text-muted)] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg border border-[var(--pc-border)] bg-[linear-gradient(135deg,var(--pc-blue-soft),var(--pc-primary-soft))] backdrop-blur-xl">
            <FileText className="size-4 text-emerald-200" />
          </span>
          <div>
            <p className="font-medium text-[var(--pc-text)]">PDFCraft</p>
            <p>PDFCraft — secure PDF tools for modern document workflows.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="transition hover:text-[var(--pc-text)]" href="/tools">
            Tools
          </Link>
          <Link className="transition hover:text-[var(--pc-text)]" href="/tools/protect-pdf">
            Protect PDF
          </Link>
          <Link className="transition hover:text-[var(--pc-text)]" href="/tools/unlock-pdf">
            Unlock PDF
          </Link>
        </div>
      </div>
    </footer>
  );
}
