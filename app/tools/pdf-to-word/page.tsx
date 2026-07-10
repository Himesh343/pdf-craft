import { PageHeader } from "@/components/site/page-header";
import { PdfToWordTool } from "@/components/tools/pdf-to-word-tool";

export default function PdfToWordPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="PDF to Word"
        title="Convert PDF to Word"
        description="Upload a PDF and convert its text into an editable Word document."
      />
      <div className="mt-10">
        <PdfToWordTool />
      </div>
    </section>
  );
}
