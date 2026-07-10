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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Tools
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Choose the right PDF workflow.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Select a tool to protect documents, convert files, or prepare exports
            for your document workflow.
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Complete your document workflow in three steps.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-400 text-sm font-bold text-[#050816]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
