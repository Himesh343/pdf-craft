import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Tools", href: "/tools" },
  { label: "Edit PDF", href: "/tools/edit-pdf" },
  { label: "Protect PDF", href: "/tools/protect-pdf" },
  { label: "Unlock PDF", href: "/tools/unlock-pdf" },
  { label: "PDF to Word", href: "/tools/pdf-to-word" },
  { label: "Google Docs", href: "/tools/google-docs" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-white/15 bg-white/8 shadow-lg shadow-cyan-500/10">
            <FileText className="size-5 text-cyan-200" />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            PDFCraft
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/tools"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-3 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/12"
        >
          <ShieldCheck className="size-4 text-cyan-200" />
          Get Started
        </Link>
      </div>
    </header>
  );
}
