import Link from "next/link";
import { ArrowLeft, Cloud, KeyRound, Route, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ComingSoon() {
  const items = [
    {
      icon: KeyRound,
      title: "Google OAuth",
      description: "Secure account authorization for Google Drive access.",
    },
    {
      icon: Cloud,
      title: "Drive export",
      description: "Upload, convert, and open documents from Google Drive.",
    },
    {
      icon: Route,
      title: "Workspace handoff",
      description: "Open converted files directly in your Google Docs workspace.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-white/12 bg-white/[0.06] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex size-14 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Cloud className="size-7" />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Coming Soon
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Convert PDF to Google Docs
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Connect Google Drive to upload a PDF, convert it into an editable
              Google Docs file, and open it directly in your workspace.
            </p>
            <div className="mt-6 rounded-xl border border-white/12 bg-[#050816]/60 p-4 text-sm leading-6 text-slate-300">
              This feature requires Google OAuth and Drive API integration. It
              will be added after the core PDF protection workflow is completed.
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 px-5 text-white hover:opacity-90"
                render={<Link href="/tools" />}
              >
                <ArrowLeft className="size-4" />
                Back to Tools
              </Button>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-4 py-2.5 text-sm text-slate-200">
                <ShieldCheck className="size-4 text-cyan-200" />
                Coming Soon
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/12 bg-[#050816]/60 p-5"
                >
                  <div className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/8 text-cyan-100">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
