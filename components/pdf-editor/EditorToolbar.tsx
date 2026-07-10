"use client";

import type { ComponentType } from "react";
import {
  CheckSquare,
  Eraser,
  FileStack,
  Highlighter,
  MousePointer2,
  RectangleHorizontal,
  ScanLine,
  Signature,
  Sparkles,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfEditTool } from "@/types/pdf";

const tools: Array<{
  value: PdfEditTool;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "select", label: "Select", icon: MousePointer2 },
  { value: "text", label: "Add Text", icon: Type },
  { value: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { value: "highlight", label: "Highlight", icon: Highlighter },
  { value: "redact", label: "Redact", icon: ScanLine },
  { value: "removeText", label: "Remove Text", icon: Eraser },
  { value: "signature", label: "Signature", icon: Signature },
  { value: "blur", label: "Blur", icon: Sparkles },
  { value: "pages", label: "Pages", icon: FileStack },
];

interface EditorToolbarProps {
  activeTool: PdfEditTool;
  disabled: boolean;
  onToolChange: (tool: PdfEditTool) => void;
}

export function EditorToolbar({
  activeTool,
  disabled,
  onToolChange,
}: EditorToolbarProps) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.06] p-3 backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5 xl:grid-cols-9">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.value;

          return (
            <Button
              key={tool.value}
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onToolChange(tool.value)}
              className={cn(
                "h-10 justify-start border-white/12 bg-[#050816]/60 px-3 text-slate-300 hover:bg-white/10 hover:text-white",
                isActive && "border-cyan-300/50 bg-cyan-300/10 text-white"
              )}
            >
              {isActive ? <CheckSquare className="size-4" /> : <Icon className="size-4" />}
              <span className="truncate">{tool.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
