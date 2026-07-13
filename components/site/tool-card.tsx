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
import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";

import type { ToolDefinition, ToolIconName } from "@/data/site";
import { cn } from "@/lib/utils";

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

function ToolCardContent({ tool }: { tool: ToolDefinition }) {
  const Icon = iconMap[tool.icon];
  const isAvailable = tool.status === "Available";

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-lg border",
            isAvailable
              ? "pc-icon-box"
              : "border-[var(--pc-border-soft)] bg-[rgba(15,23,42,0.38)] text-[var(--pc-text-muted)] opacity-75 backdrop-blur-xl"
          )}
        >
          <Icon className="size-6" />
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-xl",
            isAvailable
              ? "border-[color-mix(in_srgb,var(--pc-success)_38%,var(--pc-border))] bg-[var(--pc-success-soft)] text-emerald-100"
              : "border-[var(--pc-border-soft)] bg-[rgba(15,23,42,0.42)] text-[var(--pc-text-muted)]"
          )}
        >
          {tool.status}
        </span>
      </div>
      <div className="mt-6 flex-1">
        <p className="pc-eyebrow text-xs font-semibold uppercase tracking-[0.18em]">
          {tool.badge}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--pc-text)]">
          {tool.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--pc-text-secondary)]">
          {tool.description}
        </p>
      </div>
      {isAvailable ? (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--pc-text)]">
          {tool.actionLabel}
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-[var(--pc-border-soft)] bg-[rgba(15,23,42,0.38)] px-4 text-sm font-medium text-[var(--pc-text-muted)] backdrop-blur-xl"
        >
          {tool.actionLabel}
        </button>
      )}
    </>
  );
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const isAvailable = tool.status === "Available";
  const baseClassName = cn(
    "group flex h-full flex-col rounded-xl p-5 transition duration-300",
    isAvailable
      ? "pc-card hover:border-[var(--pc-border-active)] hover:bg-[var(--pc-card-hover)] hover:shadow-emerald-950/20"
      : "pc-card-soft cursor-default opacity-70"
  );

  const content: ReactNode = <ToolCardContent tool={tool} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: "easeOut" }}
      whileHover={isAvailable ? { y: -6 } : undefined}
      className="h-full"
    >
      {isAvailable ? (
        <Link href={tool.href} className={baseClassName}>
          {content}
        </Link>
      ) : (
        <div className={baseClassName} aria-disabled="true">
          {content}
        </div>
      )}
    </motion.div>
  );
}
