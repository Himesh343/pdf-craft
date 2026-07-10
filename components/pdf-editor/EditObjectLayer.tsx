"use client";

import Image from "next/image";
import { Rnd } from "react-rnd";

import { cn } from "@/lib/utils";
import type { PdfEditObject } from "@/types/pdf";

interface EditObjectLayerProps {
  objects: PdfEditObject[];
  selectedObjectId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PdfEditObject>) => void;
}

function getObjectClassName(object: PdfEditObject, selected: boolean) {
  return cn(
    "group pointer-events-auto relative flex overflow-hidden border transition",
    selected ? "border-cyan-200 ring-2 ring-cyan-300/30" : "border-cyan-200/30",
    object.type === "text" && "items-start bg-transparent p-1 text-white",
    object.type === "rectangle" && "bg-transparent",
    object.type === "highlight" && "border-yellow-200/40 bg-yellow-300/35",
    object.type === "redact" && "border-black bg-black",
    object.type === "removeText" && "border-white bg-white",
    object.type === "signature" && "items-center bg-white/5 p-1 text-cyan-950",
    object.type === "blur" && "border-cyan-200/40 bg-cyan-100/35 backdrop-blur-sm"
  );
}

function renderObject(object: PdfEditObject) {
  if (object.type === "text") {
    return (
      <span
        className="whitespace-pre-wrap leading-tight"
        style={{
          color: object.color,
          fontSize: object.fontSize,
          fontWeight: object.bold ? 700 : 400,
        }}
      >
        {object.text || "Text"}
      </span>
    );
  }

  if (object.type === "rectangle") {
    return (
      <div
        className="size-full"
        style={{
          backgroundColor: object.fillColor,
          borderColor: object.borderColor,
          borderWidth: object.borderWidth,
          borderStyle: "solid",
          opacity: object.opacity,
        }}
      />
    );
  }

  if (object.type === "signature") {
    if (object.imageData) {
      return (
        <Image
          src={object.imageData}
          alt="Signature"
          fill
          unoptimized
          sizes="220px"
          className="object-contain"
        />
      );
    }

    return (
      <span
        className="w-full truncate font-serif italic leading-tight"
        style={{ color: object.color, fontSize: object.fontSize }}
      >
        {object.text || "Signature"}
      </span>
    );
  }

  if (object.type === "redact") {
    return <span className="sr-only">Redaction area</span>;
  }

  if (object.type === "removeText") {
    return <span className="sr-only">Remove Text area</span>;
  }

  if (object.type === "blur") {
    return <span className="m-auto text-xs font-medium text-cyan-950/70">Blur</span>;
  }

  return null;
}

export function EditObjectLayer({
  objects,
  selectedObjectId,
  onSelect,
  onUpdate,
}: EditObjectLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {objects.map((object) => {
        const selected = selectedObjectId === object.id;

        return (
          <Rnd
            key={object.id}
            bounds="parent"
            position={{ x: object.x, y: object.y }}
            size={{ width: object.width, height: object.height }}
            minWidth={24}
            minHeight={18}
            onMouseDown={(event: MouseEvent) => {
              event.stopPropagation();
              onSelect(object.id);
            }}
            onDragStop={(_, data) => {
              onUpdate(object.id, { x: data.x, y: data.y } as Partial<PdfEditObject>);
            }}
            onResizeStop={(_, __, ref, ___, position) => {
              onUpdate(object.id, {
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              } as Partial<PdfEditObject>);
            }}
            className={getObjectClassName(object, selected)}
          >
            {renderObject(object)}
          </Rnd>
        );
      })}
    </div>
  );
}
