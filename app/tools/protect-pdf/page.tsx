import { PageHeader } from "@/components/site/page-header";
import { ProtectPdfTool } from "@/components/tools/protect-pdf-tool";

export default function ProtectPdfPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Protect PDF"
        title="Protect PDF"
        description="Set a password to protect your PDF file before sharing it."
      />
      <div className="mt-10">
        <ProtectPdfTool />
      </div>
    </section>
  );
}
