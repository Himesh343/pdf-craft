import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Tools", href: "/tools" },
  { label: "Protect PDF", href: "/tools/protect-pdf" },
  { label: "Unlock PDF", href: "/tools/unlock-pdf" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--pc-border-soft)] bg-[rgba(5,7,13,0.68)] shadow-lg shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-[var(--pc-border)] bg-[linear-gradient(135deg,var(--pc-blue-soft),var(--pc-primary-soft))] shadow-lg shadow-black/25 backdrop-blur-xl">
            <FileText className="size-5 text-emerald-200" />
          </span>
          <span className="text-base font-semibold tracking-tight text-[var(--pc-text)]">
            PDFCraft
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--pc-text-secondary)] transition hover:text-[var(--pc-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/tools/protect-pdf"
          className="pc-secondary-button inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition"
        >
          <ShieldCheck className="size-4 text-[var(--pc-accent)]" />
          Get Started
        </Link>
      </div>
    </header>
  );
}
