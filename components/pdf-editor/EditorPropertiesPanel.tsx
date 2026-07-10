"use client";

import { Download, RotateCw, Trash2, Undo2 } from "lucide-react";

import { RedactionNotice } from "@/components/pdf-editor/RedactionNotice";
import { SignaturePad } from "@/components/pdf-editor/SignaturePad";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PdfEditObject, PdfEditTool } from "@/types/pdf";

interface EditorPropertiesPanelProps {
  activeTool: PdfEditTool;
  selectedObject: PdfEditObject | null;
  hasPdf: boolean;
  isExporting: boolean;
  onUpdateObject: (id: string, updates: Partial<PdfEditObject>) => void;
  onDeleteObject: (id: string) => void;
  onAddSignatureImage: (imageData: string) => void;
  onRotateCurrentPage: () => void;
  onDeleteCurrentPage: () => void;
  onResetChanges: () => void;
  onExport: () => void;
}

function getObjectName(object: PdfEditObject | null) {
  if (!object) {
    return "No object selected";
  }

  const names: Record<PdfEditObject["type"], string> = {
    text: "Text",
    rectangle: "Rectangle",
    highlight: "Highlight",
    redact: "Redaction",
    removeText: "Remove Text",
    signature: "Signature",
    blur: "Blur",
  };

  return names[object.type];
}

export function EditorPropertiesPanel({
  activeTool,
  selectedObject,
  hasPdf,
  isExporting,
  onUpdateObject,
  onDeleteObject,
  onAddSignatureImage,
  onRotateCurrentPage,
  onDeleteCurrentPage,
  onResetChanges,
  onExport,
}: EditorPropertiesPanelProps) {
  const updateSelected = (updates: Partial<PdfEditObject>) => {
    if (selectedObject) {
      onUpdateObject(selectedObject.id, updates);
    }
  };

  return (
    <aside className="space-y-5 rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Tool settings
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          {getObjectName(selectedObject)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {activeTool === "redact"
            ? "Redaction covers selected content with a black box."
            : activeTool === "removeText"
              ? "Remove Text covers selected content with a clean white area."
              : activeTool === "blur"
                ? "Blur visually obscures selected content. For confidential information, use Redact."
                : "Select an object on the page to fine-tune its settings."}
        </p>
      </div>

      <RedactionNotice />

      {selectedObject ? (
        <div className="space-y-4 rounded-xl border border-white/12 bg-[#050816]/60 p-4">
          {selectedObject.type === "text" ? (
            <>
              <div className="space-y-2">
                <Label className="text-slate-200" htmlFor="edit-text-content">
                  Content
                </Label>
                <Input
                  id="edit-text-content"
                  value={selectedObject.text}
                  onChange={(event) => updateSelected({ text: event.target.value } as Partial<PdfEditObject>)}
                  className="h-10 border-white/12 bg-[#050816]/80 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="edit-font-size">
                    Font size
                  </Label>
                  <Input
                    id="edit-font-size"
                    type="number"
                    min={8}
                    max={96}
                    value={selectedObject.fontSize}
                    onChange={(event) => updateSelected({ fontSize: Number(event.target.value) } as Partial<PdfEditObject>)}
                    className="h-10 border-white/12 bg-[#050816]/80 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="edit-text-color">
                    Color
                  </Label>
                  <Input
                    id="edit-text-color"
                    type="color"
                    value={selectedObject.color}
                    onChange={(event) => updateSelected({ color: event.target.value } as Partial<PdfEditObject>)}
                    className="h-10 border-white/12 bg-[#050816]/80 p-1"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-lg border border-white/12 bg-white/5 p-3 text-sm text-slate-200">
                <Checkbox
                  checked={selectedObject.bold}
                  onCheckedChange={(checked) => updateSelected({ bold: Boolean(checked) } as Partial<PdfEditObject>)}
                  className="border-white/25 data-checked:border-cyan-300 data-checked:bg-cyan-400 data-checked:text-[#050816]"
                />
                Bold
              </label>
            </>
          ) : null}

          {selectedObject.type === "rectangle" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="rect-border">
                    Border
                  </Label>
                  <Input
                    id="rect-border"
                    type="color"
                    value={selectedObject.borderColor}
                    onChange={(event) => updateSelected({ borderColor: event.target.value } as Partial<PdfEditObject>)}
                    className="h-10 border-white/12 bg-[#050816]/80 p-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="rect-fill">
                    Fill
                  </Label>
                  <Input
                    id="rect-fill"
                    type="color"
                    value={selectedObject.fillColor}
                    onChange={(event) => updateSelected({ fillColor: event.target.value } as Partial<PdfEditObject>)}
                    className="h-10 border-white/12 bg-[#050816]/80 p-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="rect-border-width">
                    Border width
                  </Label>
                  <Input
                    id="rect-border-width"
                    type="number"
                    min={0}
                    max={16}
                    value={selectedObject.borderWidth}
                    onChange={(event) => updateSelected({ borderWidth: Number(event.target.value) } as Partial<PdfEditObject>)}
                    className="h-10 border-white/12 bg-[#050816]/80 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="rect-opacity">
                    Opacity
                  </Label>
                  <Input
                    id="rect-opacity"
                    type="number"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={selectedObject.opacity}
                    onChange={(event) => updateSelected({ opacity: Number(event.target.value) } as Partial<PdfEditObject>)}
                    className="h-10 border-white/12 bg-[#050816]/80 text-white"
                  />
                </div>
              </div>
            </>
          ) : null}

          {selectedObject.type === "highlight" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-200" htmlFor="highlight-color">
                  Color
                </Label>
                <Input
                  id="highlight-color"
                  type="color"
                  value={selectedObject.fillColor}
                  onChange={(event) => updateSelected({ fillColor: event.target.value } as Partial<PdfEditObject>)}
                  className="h-10 border-white/12 bg-[#050816]/80 p-1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200" htmlFor="highlight-opacity">
                  Opacity
                </Label>
                <Input
                  id="highlight-opacity"
                  type="number"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={selectedObject.opacity}
                  onChange={(event) => updateSelected({ opacity: Number(event.target.value) } as Partial<PdfEditObject>)}
                  className="h-10 border-white/12 bg-[#050816]/80 text-white"
                />
              </div>
            </div>
          ) : null}

          {selectedObject.type === "signature" ? (
            <>
              <div className="space-y-2">
                <Label className="text-slate-200" htmlFor="signature-text">
                  Typed signature
                </Label>
                <Input
                  id="signature-text"
                  value={selectedObject.text}
                  onChange={(event) => updateSelected({ text: event.target.value, imageData: undefined } as Partial<PdfEditObject>)}
                  className="h-10 border-white/12 bg-[#050816]/80 text-white"
                />
              </div>
              <SignaturePad
                onUseSignature={(imageData) => updateSelected({ imageData } as Partial<PdfEditObject>)}
              />
            </>
          ) : null}

          {selectedObject.type === "blur" ? (
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="blur-opacity">
                Strength
              </Label>
              <Input
                id="blur-opacity"
                type="number"
                min={0.15}
                max={0.95}
                step={0.05}
                value={selectedObject.opacity}
                onChange={(event) => updateSelected({ opacity: Number(event.target.value) } as Partial<PdfEditObject>)}
                className="h-10 border-white/12 bg-[#050816]/80 text-white"
              />
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => onDeleteObject(selectedObject.id)}
            className="w-full border-rose-300/20 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
          >
            <Trash2 className="size-4" />
            Delete Selected Object
          </Button>
        </div>
      ) : activeTool === "signature" ? (
        <div className="space-y-3 rounded-xl border border-white/12 bg-[#050816]/60 p-4">
          <p className="text-sm text-slate-300">
            Draw a signature, then place it on the current page.
          </p>
          <SignaturePad onUseSignature={onAddSignatureImage} />
        </div>
      ) : null}

      <div className="space-y-3 rounded-xl border border-white/12 bg-[#050816]/60 p-4">
        <h3 className="text-sm font-semibold text-white">Page actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!hasPdf}
            onClick={onRotateCurrentPage}
            className="border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
          >
            <RotateCw className="size-4" />
            Rotate
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasPdf}
            onClick={onDeleteCurrentPage}
            className="border-rose-300/20 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-white/12 bg-[#050816]/60 p-4">
        <h3 className="text-sm font-semibold text-white">Export</h3>
        <Button
          type="button"
          disabled={!hasPdf || isExporting}
          onClick={onExport}
          className={cn(
            "h-11 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white hover:opacity-90",
            isExporting && "opacity-80"
          )}
        >
          <Download className="size-4" />
          Download Edited PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!hasPdf || isExporting}
          onClick={onResetChanges}
          className="w-full border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
        >
          <Undo2 className="size-4" />
          Reset All Changes
        </Button>
      </div>
    </aside>
  );
}
