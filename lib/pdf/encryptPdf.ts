import type { EncryptPdfOptions, PdfPermissionOptions } from "@/types/pdf";

import {
  cleanupFiles,
  createVirtualPdfPath,
  getQpdfInstance,
  type WritableQpdfFS,
} from "./qpdfWasm";

function ensureSecureRandomSupport() {
  if (!window.crypto?.getRandomValues) {
    throw new Error("Your browser does not support secure password generation.");
  }
}

function createOwnerPassword() {
  ensureSecureRandomSupport();

  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getModifyPermission(permissions: PdfPermissionOptions) {
  if (permissions.allowAnnotations) {
    return "annotate";
  }

  if (permissions.allowFormFilling) {
    return "form";
  }

  return "none";
}

function getEncryptionArgs(options: EncryptPdfOptions, ownerPassword: string) {
  const args = [
    "--encrypt",
    options.userPassword,
    ownerPassword,
    options.encryption === "aes-128" ? "128" : "256",
  ];

  if (options.encryption === "aes-128") {
    args.push("--use-aes=y");
  }

  args.push(
    `--print=${options.permissions.allowPrinting ? "full" : "none"}`,
    `--extract=${options.permissions.allowCopying ? "y" : "n"}`,
    `--modify=${getModifyPermission(options.permissions)}`
  );

  return args;
}

export async function encryptPdfWithPassword(
  options: EncryptPdfOptions
): Promise<Blob> {
  if (!options.file) {
    throw new Error("Please choose a PDF file.");
  }

  if (!options.userPassword) {
    throw new Error("Password is required.");
  }

  const qpdf = await getQpdfInstance();
  const inputPath = createVirtualPdfPath("input", options.file.name);
  const outputPath = createVirtualPdfPath("output", "protected.pdf");
  const inputBuffer = await options.file.arrayBuffer();
  const inputBytes = new Uint8Array(inputBuffer);
  const fs = qpdf.FS as WritableQpdfFS;

  fs.writeFile(inputPath, inputBytes);

  // QPDF AES-256 encryption requires distinct user and owner passwords.
  // If the user does not provide an owner password, generate a strong internal
  // owner password so document permissions are enforced without exposing it.
  const ownerPassword = options.ownerPassword?.trim() || createOwnerPassword();
  const args = [
    ...getEncryptionArgs(options, ownerPassword),
    "--",
    inputPath,
    outputPath,
  ];

  try {
    const exitCode = qpdf.callMain(args);

    if (exitCode !== 0) {
      throw new Error("PDF encryption failed.");
    }

    const output = qpdf.FS.readFile(outputPath);

    if (!output?.byteLength) {
      throw new Error("PDF encryption did not return a file.");
    }

    const outputCopy = new Uint8Array(output.byteLength);
    outputCopy.set(output);

    return new Blob([outputCopy.buffer], { type: "application/pdf" });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Unable to protect PDF: ${error.message}`
        : "Unable to protect PDF."
    );
  } finally {
    cleanupFiles(qpdf, [inputPath, outputPath]);
  }
}
