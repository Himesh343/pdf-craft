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
    title: "Edit PDF",
    description:
      "Add text, highlight, draw shapes, sign, blur, remove text, redact content, and manage PDF pages.",
    href: "/tools/edit-pdf",
    icon: "edit",
    badge: "EDIT",
    status: "Available",
    actionLabel: "Open Tool",
  },
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
    title: "PDF to Word",
    description:
      "Convert text-based PDF files into downloadable editable Word documents.",
    href: "/tools/pdf-to-word",
    icon: "file-text",
    badge: "CONVERT",
    status: "Available",
    actionLabel: "Open Tool",
  },
  {
    title: "PDF to Google Docs",
    description:
      "Connect Google Drive in a future release to upload, convert, and open PDFs as Google Docs.",
    href: "/tools/google-docs",
    icon: "cloud",
    badge: "GOOGLE DRIVE",
    status: "Coming Soon",
    actionLabel: "View Details",
  },
];

export const heroStats = [
  {
    title: "Complete PDF workflows",
    description: "Editing, protection, unlocking, conversion, and export flows.",
  },
  {
    title: "Fast interactions",
    description: "Simple upload, configure, edit, and download experience.",
  },
  {
    title: "Privacy-focused",
    description: "Clear handling for sensitive documents.",
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
      "Password fields, edit tools, unlock inputs, and permission controls are presented clearly before processing begins.",
    icon: "key",
  },
  {
    title: "Scalable architecture",
    description:
      "The interface is structured so editing, protection, unlocking, conversion, and cloud export services can evolve cleanly.",
    icon: "sparkles",
  },
];

export const howItWorksSteps: StepDefinition[] = [
  {
    title: "Choose a tool",
    description:
      "Select editing, protection, unlocking, conversion, or Google Docs workflow based on your document need.",
  },
  {
    title: "Upload your PDF",
    description:
      "Add a PDF file, review file details, and configure the available options.",
  },
  {
    title: "Download or continue",
    description:
      "Once processing is complete, download the result or continue with the next action.",
  },
];

export const toolHighlights: FeatureDefinition[] = [
  {
    title: "Polished inputs",
    description:
      "Every workflow includes clear file selection, configuration options, and action controls.",
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
      "The interface supports editing, protection, and unlocking flows while keeping conversion and export paths ready to expand.",
    icon: "lock",
  },
];
