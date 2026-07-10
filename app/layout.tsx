import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { PageShell } from "@/components/site/page-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const stripExtensionHydrationAttributes = "\n(function () {\n  var attributeName = \"data-locator-target\";\n  var timeout = window.setTimeout(function () {\n    observer.disconnect();\n  }, 5000);\n\n  function stripAttribute() {\n    document.documentElement.removeAttribute(attributeName);\n    if (document.body) {\n      document.body.removeAttribute(attributeName);\n    }\n  }\n\n  var observer = new MutationObserver(stripAttribute);\n\n  stripAttribute();\n  observer.observe(document.documentElement, {\n    attributes: true,\n    attributeFilter: [attributeName]\n  });\n\n  document.addEventListener(\"DOMContentLoaded\", function () {\n    stripAttribute();\n    if (document.body) {\n      observer.observe(document.body, {\n        attributes: true,\n        attributeFilter: [attributeName]\n      });\n    }\n  });\n\n  window.addEventListener(\"load\", function () {\n    stripAttribute();\n    window.clearTimeout(timeout);\n    window.setTimeout(function () {\n      observer.disconnect();\n    }, 1000);\n  }, { once: true });\n})();\n";

export const metadata: Metadata = {
  title: "PDFCraft | Modern PDF Tools",
  description:
    "Modern PDF tools for secure document workflows, protection settings, and document conversion experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={
        geistSans.variable +
        " " +
        geistMono.variable +
        " dark h-full antialiased"
      }
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#050816] text-white"
      >
        <PageShell>{children}</PageShell>
        <Script
          id="strip-extension-hydration-attributes"
          strategy="beforeInteractive"
        >
          {stripExtensionHydrationAttributes}
        </Script>
      </body>
    </html>
  );
}
