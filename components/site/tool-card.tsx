"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  FileLock2,
  FilePenLine,
  FileText,
  KeyRound,
} from "lucide-react";
import type { ComponentType } from "react";
import { motion } from "framer-motion";

import type { ToolDefinition, ToolIconName } from "@/data/site";

const iconMap = {
  cloud: Cloud,
  edit: FilePenLine,
  "file-lock": FileLock2,
  "file-text": FileText,
  "file-unlock": KeyRound,
} satisfies Record<ToolIconName, ComponentType<{ className?: string }>>;

interface ToolCardProps {
  tool: ToolDefinition;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const Icon = iconMap[tool.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link
        href={tool.href}
        className="group flex h-full flex-col rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-cyan-300/35 hover:bg-white/[0.09]"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-lg border border-white/12 bg-white/8">
            <Icon className="size-6 text-cyan-200" />
          </span>
          <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-xs font-medium text-slate-200">
            {tool.status}
          </span>
        </div>
        <div className="mt-6 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {tool.badge}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            {tool.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {tool.description}
          </p>
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
          {tool.actionLabel}
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}
