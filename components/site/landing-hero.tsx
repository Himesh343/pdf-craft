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
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-sm text-slate-200 backdrop-blur-xl"
        >
          <Sparkles className="size-4 text-cyan-200" />
          Secure PDF tools for modern document workflows
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55 }}
          className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Convert, protect, and manage PDFs with confidence.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.55 }}
          className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
        >
          PDFCraft helps you protect documents, prepare PDF-to-Word conversions,
          and streamline Google Docs workflows through a clean, secure, and
          easy-to-use interface.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.55 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/tools"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] hover:opacity-95"
          >
            Explore Tools
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/tools/protect-pdf"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/8 px-5 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/12"
          >
            <FileLock2 className="size-4 text-cyan-200" />
            Protect PDF
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.55 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {heroStats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-white/12 bg-white/[0.05] p-4 backdrop-blur-xl"
            >
              <p className="text-base font-semibold text-white">{stat.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
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
        <div className="absolute inset-x-6 top-8 h-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-md">
          <div className="absolute left-8 top-8 h-[28rem] w-72 rotate-[-10deg] rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-xl" />
          <div className="absolute right-5 top-16 h-[27rem] w-72 rotate-[9deg] rounded-2xl border border-purple-300/20 bg-purple-300/[0.06] backdrop-blur-xl" />
          <div className="relative rounded-2xl border border-white/15 bg-[#0b1024]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
                  <FileText className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">Quarterly-report.pdf</p>
                  <p className="text-sm text-slate-400">2.4 MB</p>
                </div>
              </div>
              <ShieldCheck className="size-5 text-emerald-300" />
            </div>
            <div className="space-y-4 py-6">
              <div className="h-3 w-3/4 rounded-full bg-white/14" />
              <div className="h-3 w-full rounded-full bg-white/10" />
              <div className="h-3 w-5/6 rounded-full bg-white/10" />
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="h-24 rounded-xl border border-cyan-300/20 bg-cyan-300/10" />
                <div className="h-24 rounded-xl border border-purple-300/20 bg-purple-300/10" />
              </div>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/[0.06] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Document workflow</span>
                <span className="font-semibold text-cyan-100">Ready</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400"
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
