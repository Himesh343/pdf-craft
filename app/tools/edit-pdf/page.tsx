import { PageHeader } from "@/components/site/page-header";
import { PdfEditorClient } from "@/components/pdf-editor/PdfEditorClient";

export default function EditPdfPage() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Edit PDF"
        title="Edit PDF"
        description="Add text, highlight areas, draw shapes, sign documents, remove unwanted text, redact sensitive information, and manage PDF pages."
      />
      <div className="mt-10">
        <PdfEditorClient />
      </div>
    </section>
  );
}
