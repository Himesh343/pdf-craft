import Link from "next/link";
import { ArrowLeft, Clock3, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ComingSoon() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="pc-card-strong rounded-xl p-6 text-center sm:p-8 lg:p-10">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--pc-accent)_32%,var(--pc-border))] bg-[var(--pc-accent-soft)] text-[var(--pc-accent)] shadow-lg shadow-amber-950/10 backdrop-blur-xl">
          <Clock3 className="size-7" />
        </span>
        <p className="pc-eyebrow mt-6 text-sm font-semibold uppercase tracking-[0.2em]">
          Planned
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-5xl">
          Coming Soon
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--pc-text-secondary)]">
          This workflow is planned for a future PDFCraft release. Protect PDF and
          Unlock PDF are available now.
        </p>
        <div className="pc-card-soft mx-auto mt-6 max-w-xl rounded-xl p-4 text-sm leading-6 text-[var(--pc-text-secondary)]">
          PDFCraft is launching first with secure PDF protection and unlocking
          workflows so the public release stays focused, stable, and privacy-focused.
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="pc-primary-button h-11 px-5 hover:opacity-100"
            render={<Link href="/tools" />}
          >
            <ArrowLeft className="size-4" />
            Back to Tools
          </Button>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--pc-border)] bg-[rgba(15,23,42,0.44)] px-4 py-2.5 text-sm text-[var(--pc-text-secondary)] backdrop-blur-xl">
            <ShieldCheck className="size-4 text-[var(--pc-success)]" />
            Available now: Protect PDF and Unlock PDF
          </div>
        </div>
      </div>
    </section>
  );
}
