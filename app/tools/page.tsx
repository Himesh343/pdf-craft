import { FeatureSection } from "@/components/site/feature-section";
import { PageHeader } from "@/components/site/page-header";
import { ToolCard } from "@/components/site/tool-card";
import { toolHighlights, tools } from "@/data/site";

export default function ToolsPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="PDF Tools"
          title="Choose a PDF workflow"
          description="Start with a focused tool for protecting, converting, or preparing PDF documents for your workflow."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tools.map((tool, index) => (
            <ToolCard key={tool.href} tool={tool} index={index} />
          ))}
        </div>
      </section>
      <FeatureSection
        eyebrow="WORKFLOW EXPERIENCE"
        title="Built for clarity, speed, and control."
        description="Each tool is designed with clear inputs, guided steps, validation states, and result screens to support a professional document workflow."
        features={toolHighlights}
      />
    </>
  );
}
