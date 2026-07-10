import { PageHeader } from "@/components/site/page-header";
import { UnlockPdfTool } from "@/components/tools/unlock-pdf-tool";

export default function UnlockPdfPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Unlock PDF"
        title="Unlock a password-protected PDF"
        description="Upload a protected PDF, enter the current password, and generate an unlocked copy for easier access."
      />
      <div className="mt-10">
        <UnlockPdfTool />
      </div>
    </section>
  );
}
