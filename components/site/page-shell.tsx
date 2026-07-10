import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute right-[-12rem] top-40 h-[30rem] w-[30rem] rounded-full bg-purple-500/12 blur-3xl" />
        <div className="absolute bottom-0 left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
