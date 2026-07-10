import type { UnlockPdfOptions } from "@/types/pdf";

import {
  cleanupFiles,
  createVirtualPdfPath,
  getQpdfInstance,
  type WritableQpdfFS,
} from "./qpdfWasm";

const ENCRYPT_MARKER = new Uint8Array([47, 69, 110, 99, 114, 121, 112, 116]);

function containsPdfEncryptionMarker(bytes: Uint8Array) {
  for (let index = 0; index <= bytes.length - ENCRYPT_MARKER.length; index += 1) {
    let matches = true;

    for (let offset = 0; offset < ENCRYPT_MARKER.length; offset += 1) {
      if (bytes[index + offset] !== ENCRYPT_MARKER[offset]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return true;
    }
  }

  return false;
}

export async function unlockPdfWithPassword(
  options: UnlockPdfOptions
): Promise<Blob> {
  if (!options.file) {
    throw new Error("Please choose a PDF file.");
  }

  if (!options.password.trim()) {
    throw new Error("Current PDF password is required.");
  }

  const inputBuffer = await options.file.arrayBuffer();
  const inputBytes = new Uint8Array(inputBuffer);

  if (!containsPdfEncryptionMarker(inputBytes)) {
    throw new Error("This PDF does not appear to be password-protected.");
  }

  const qpdf = await getQpdfInstance();
  const inputPath = createVirtualPdfPath("locked-input", options.file.name);
  const outputPath = createVirtualPdfPath("unlocked-output", "unlocked.pdf");
  const fs = qpdf.FS as WritableQpdfFS;

  fs.writeFile(inputPath, inputBytes);

  try {
    const exitCode = qpdf.callMain([
      `--password=${options.password}`,
      "--decrypt",
      inputPath,
      outputPath,
    ]);

    if (exitCode !== 0) {
      throw new Error(
        "The password is incorrect or this PDF cannot be unlocked with the provided password."
      );
    }

    const output = qpdf.FS.readFile(outputPath);

    if (!output?.byteLength) {
      throw new Error("PDF unlock did not return a file.");
    }

    const outputCopy = new Uint8Array(output.byteLength);
    outputCopy.set(output);

    return new Blob([outputCopy.buffer], { type: "application/pdf" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to unlock PDF: ${error.message}`);
    }

    throw new Error("Unable to unlock PDF.");
  } finally {
    cleanupFiles(qpdf, [inputPath, outputPath]);
  }
}
