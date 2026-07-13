import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-[var(--pc-bg)] text-[var(--pc-text)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_82%_0%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_75%_86%,rgba(245,158,11,0.08),transparent_34%),linear-gradient(180deg,#05070d_0%,#0b1220_52%,#05070d_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_80px] opacity-30" />
      </div>
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
