import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  align?: "left" | "center";
}

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: PageHeaderProps) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl text-left"
      }
    >
      {eyebrow ? (
        <Badge className="mb-4 border-[color-mix(in_srgb,var(--pc-accent)_30%,var(--pc-border))] bg-[var(--pc-accent-soft)] text-[var(--pc-accent)]">
          {eyebrow}
        </Badge>
      ) : null}
      <h1 className="text-4xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--pc-text-secondary)] sm:text-lg">
        {description}
      </p>
    </div>
  );
}
