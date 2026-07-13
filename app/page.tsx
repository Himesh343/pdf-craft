import { FeatureSection } from "@/components/site/feature-section";
import { LandingHero } from "@/components/site/landing-hero";
import { ToolCard } from "@/components/site/tool-card";
import { howItWorksSteps, privacyFeatures, tools } from "@/data/site";

export default function Home() {
  return (
    <>
      <LandingHero />

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] pc-eyebrow">
            Tools
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-4xl">
            Choose the right PDF workflow.
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--pc-text-secondary)]">
            Start with secure PDF protection and unlocking tools. More editing and conversion workflows are planned.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tools.map((tool, index) => (
            <ToolCard key={tool.href} tool={tool} index={index} />
          ))}
        </div>
      </section>

      <FeatureSection
        id="privacy"
        eyebrow="PRIVACY FIRST"
        title="Designed for sensitive document workflows."
        description="PDFCraft keeps every action transparent, from file selection to protection settings, so users always understand how their documents are handled."
        features={privacyFeatures}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] pc-eyebrow">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-4xl">
            Complete your document workflow in three steps.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.title}
              className="pc-card rounded-xl p-5 transition hover:border-[var(--pc-border-active)] hover:bg-[var(--pc-card-hover)]"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--pc-primary)] text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[var(--pc-text)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--pc-text-secondary)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
