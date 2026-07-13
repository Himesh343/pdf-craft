"use client";

import {
  FileCheck2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { motion } from "framer-motion";

import type { FeatureDefinition, FeatureIconName } from "@/data/site";

const iconMap = {
  "file-check": FileCheck2,
  key: KeyRound,
  lock: LockKeyhole,
  shield: ShieldCheck,
  sparkles: Sparkles,
  wand: Wand2,
} satisfies Record<FeatureIconName, React.ComponentType<{ className?: string }>>;

interface FeatureSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  features: FeatureDefinition[];
  id?: string;
}

export function FeatureSection({
  eyebrow,
  title,
  description,
  features,
  id,
}: FeatureSectionProps) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="pc-eyebrow text-sm font-semibold uppercase tracking-[0.2em]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--pc-text-secondary)]">
            {description}
          </p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon];

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="pc-card rounded-xl p-5 transition hover:border-[var(--pc-border-active)] hover:bg-[var(--pc-card-hover)]"
              >
                <div className="flex gap-4">
                  <span className="pc-icon-box grid size-10 shrink-0 place-items-center rounded-lg">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--pc-text)]">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--pc-text-secondary)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
