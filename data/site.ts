export type ToolIconName =
  | "cloud"
  | "edit"
  | "file-lock"
  | "file-text"
  | "file-unlock";

export type FeatureIconName =
  | "file-check"
  | "key"
  | "lock"
  | "shield"
  | "sparkles"
  | "wand";

export interface ToolDefinition {
  title: string;
  description: string;
  href: string;
  icon: ToolIconName;
  badge: string;
  status: "Available" | "Planned" | "Coming Soon";
  actionLabel: string;
}

export interface FeatureDefinition {
  title: string;
  description: string;
  icon: FeatureIconName;
}

export interface StepDefinition {
  title: string;
  description: string;
}

export const tools: ToolDefinition[] = [
  {
    title: "Protect PDF",
    description:
      "Add password protection and configure document permissions before sharing sensitive PDF files.",
    href: "/tools/protect-pdf",
    icon: "file-lock",
    badge: "SECURITY",
    status: "Available",
    actionLabel: "Open Tool",
  },
  {
    title: "Unlock PDF",
    description: "Remove password protection from PDFs you own and can open.",
    href: "/tools/unlock-pdf",
    icon: "file-unlock",
    badge: "SECURITY",
    status: "Available",
    actionLabel: "Open Tool",
  },
  {
    title: "Edit PDF",
    description:
      "Add text, highlight, draw shapes, sign, blur, remove text, redact content, and manage PDF pages.",
    href: "/tools/edit-pdf",
    icon: "edit",
    badge: "EDIT",
    status: "Coming Soon",
    actionLabel: "Coming Soon",
  },
  {
    title: "PDF to Word",
    description:
      "Convert PDFs into editable Word documents or preserve the original visual layout.",
    href: "/tools/pdf-to-word",
    icon: "file-text",
    badge: "CONVERT",
    status: "Coming Soon",
    actionLabel: "Coming Soon",
  },
  {
    title: "PDF to Google Docs",
    description:
      "Connect Google Drive to upload, convert, and open PDFs as Google Docs.",
    href: "/tools/google-docs",
    icon: "cloud",
    badge: "GOOGLE DRIVE",
    status: "Coming Soon",
    actionLabel: "Coming Soon",
  },
];

export const heroStats = [
  {
    title: "Secure workflow",
    description: "Protect PDFs with passwords and configure sharing permissions.",
  },
  {
    title: "Unlock owned files",
    description: "Remove known passwords from PDFs you own and can open.",
  },
  {
    title: "Privacy-focused",
    description: "Clear file handling for sensitive document workflows.",
  },
];

export const privacyFeatures: FeatureDefinition[] = [
  {
    title: "Clear file handling",
    description:
      "Users can review selected files, size limits, and validation messages before starting any document action.",
    icon: "shield",
  },
  {
    title: "Secure configuration",
    description:
      "Password fields, unlock inputs, and permission controls are presented clearly before processing begins.",
    icon: "key",
  },
  {
    title: "Scalable architecture",
    description:
      "The interface is structured so planned editing, conversion, and cloud export services can evolve cleanly.",
    icon: "sparkles",
  },
];

export const howItWorksSteps: StepDefinition[] = [
  {
    title: "Choose a tool",
    description: "Select Protect PDF or Unlock PDF based on your document need.",
  },
  {
    title: "Upload your PDF",
    description:
      "Add a PDF file, review file details, and configure the available options.",
  },
  {
    title: "Download or continue",
    description:
      "Once processing is complete, download the result or continue with another secure workflow.",
  },
];

export const toolHighlights: FeatureDefinition[] = [
  {
    title: "Polished inputs",
    description:
      "Every available workflow includes clear file selection, configuration options, and action controls.",
    icon: "wand",
  },
  {
    title: "Readable result states",
    description:
      "Progress, completion, and download states are easy to understand at a glance.",
    icon: "file-check",
  },
  {
    title: "Ready for document processing",
    description:
      "The interface supports protection and unlocking flows while keeping planned workflows ready to expand.",
    icon: "lock",
  },
];
