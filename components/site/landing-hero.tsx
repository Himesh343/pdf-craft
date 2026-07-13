"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileLock2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import { heroStats } from "@/data/site";

export function LandingHero() {
  return (
    <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--pc-accent)_28%,var(--pc-border))] bg-[rgba(15,23,42,0.58)] px-3 py-1.5 text-sm text-[var(--pc-text-secondary)] shadow-lg shadow-black/20 backdrop-blur-xl"
        >
          <Sparkles className="size-4 text-[var(--pc-accent)]" />
          Secure PDF tools for modern document workflows
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55 }}
          className="mt-6 text-5xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-6xl lg:text-7xl"
        >
          Protect and unlock PDFs with confidence.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.55 }}
          className="mt-6 max-w-2xl text-lg leading-8 text-[var(--pc-text-secondary)]"
        >
          PDFCraft helps you add password protection to PDFs and unlock protected PDFs you own through a clean, privacy-focused document workflow.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.55 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/tools/protect-pdf"
            className="pc-primary-button inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition hover:scale-[1.02]"
          >
            Protect PDF
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/tools"
            className="pc-secondary-button inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition"
          >
            <FileLock2 className="size-4 text-[var(--pc-accent)]" />
            Explore Tools
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.55 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {heroStats.map((stat) => (
            <div key={stat.title} className="pc-card rounded-xl p-4 transition hover:border-[var(--pc-border-active)] hover:bg-[var(--pc-card-hover)]">
              <p className="text-base font-semibold text-[var(--pc-text)]">{stat.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--pc-text-muted)]">
                {stat.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6, ease: "easeOut" }}
        className="relative min-h-[32rem]"
      >
        <div className="absolute inset-x-8 top-6 h-64 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),rgba(37,99,235,0.08)_42%,transparent_68%)] blur-3xl" />
        <div className="relative mx-auto max-w-md">
          <div className="absolute left-8 top-8 h-[28rem] w-72 rotate-[-10deg] rounded-2xl border border-[var(--pc-border-soft)] bg-[rgba(15,23,42,0.38)] shadow-2xl shadow-black/25 backdrop-blur-xl" />
          <div className="absolute right-5 top-16 h-[27rem] w-72 rotate-[9deg] rounded-2xl border border-[var(--pc-border)] bg-[rgba(17,24,39,0.56)] shadow-2xl shadow-black/25 backdrop-blur-xl" />
          <div className="pc-card-strong relative rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-[var(--pc-border-soft)] pb-4">
              <div className="flex items-center gap-3">
                <span className="pc-icon-box grid size-10 place-items-center rounded-lg">
                  <FileText className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-[var(--pc-text)]">Quarterly-report.pdf</p>
                  <p className="text-sm text-[var(--pc-text-muted)]">2.4 MB</p>
                </div>
              </div>
              <ShieldCheck className="size-5 text-[var(--pc-success)]" />
            </div>
            <div className="space-y-4 py-6">
              <div className="h-3 w-3/4 rounded-full bg-[rgba(148,163,184,0.22)]" />
              <div className="h-3 w-full rounded-full bg-[rgba(148,163,184,0.14)]" />
              <div className="h-3 w-5/6 rounded-full bg-[rgba(148,163,184,0.14)]" />
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="h-24 rounded-xl border border-[color-mix(in_srgb,var(--pc-primary)_28%,var(--pc-border))] bg-[var(--pc-primary-soft)] shadow-inner shadow-emerald-950/20" />
                <div className="h-24 rounded-xl border border-[color-mix(in_srgb,var(--pc-accent)_28%,var(--pc-border))] bg-[var(--pc-accent-soft)] shadow-inner shadow-amber-950/20" />
              </div>
            </div>
            <div className="rounded-xl border border-[var(--pc-border)] bg-[rgba(15,23,42,0.58)] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--pc-text-secondary)]">Document workflow</span>
                <span className="font-semibold text-[var(--pc-success)]">Ready</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(148,163,184,0.14)]">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--pc-primary),var(--pc-primary-blue))]"
                  initial={{ width: "24%" }}
                  animate={{ width: ["24%", "78%", "46%", "88%"] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
