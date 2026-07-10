import type { QpdfInstance } from "@neslinesli93/qpdf-wasm";

const WASM_PATH = "/wasm/qpdf.wasm";

let qpdfPromise: Promise<QpdfInstance> | null = null;

export type WritableQpdfFS = QpdfInstance["FS"] & {
  writeFile: (path: string, data: Uint8Array) => void;
  unlink?: (path: string) => void;
};

export function ensureBrowserSupport() {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available in a browser.");
  }

  if (typeof WebAssembly === "undefined") {
    throw new Error("Your browser does not support WebAssembly.");
  }
}

export async function getQpdfInstance() {
  ensureBrowserSupport();

  if (!qpdfPromise) {
    qpdfPromise = import("@neslinesli93/qpdf-wasm")
      .then((module) =>
        module.default({
          locateFile: () => WASM_PATH,
          noInitialRun: true,
        } as { locateFile: () => string; noInitialRun: boolean })
      )
      .catch((error: unknown) => {
        qpdfPromise = null;
        throw new Error(
          error instanceof Error
            ? `Unable to load PDF processing engine: ${error.message}`
            : "Unable to load PDF processing engine."
        );
      });
  }

  return qpdfPromise;
}

export function cleanupFiles(qpdf: QpdfInstance, paths: string[]) {
  const fs = qpdf.FS as WritableQpdfFS;

  for (const path of paths) {
    try {
      fs.unlink?.(path);
    } catch {
      // Best-effort virtual FS cleanup.
    }
  }
}

export function createVirtualPdfPath(prefix: string, filename = "document.pdf") {
  const safeName = filename.replace(/[^a-z0-9.-]/gi, "_");

  return `/${prefix}-${Date.now()}-${safeName}`;
}
