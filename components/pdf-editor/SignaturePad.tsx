"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Eraser, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onUseSignature: (imageData: string) => void;
}

export function SignaturePad({ onUseSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#050816";
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width,
      y: ((event.clientY - rect.top) / rect.height) * event.currentTarget.height,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={520}
        height={180}
        className="h-28 w-full touch-none rounded-lg border border-white/12 bg-white"
        onPointerDown={(event) => {
          const context = event.currentTarget.getContext("2d");
          const point = getPoint(event);

          setIsDrawing(true);
          context?.beginPath();
          context?.moveTo(point.x, point.y);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!isDrawing) {
            return;
          }

          const context = event.currentTarget.getContext("2d");
          const point = getPoint(event);

          context?.lineTo(point.x, point.y);
          context?.stroke();
        }}
        onPointerUp={(event) => {
          setIsDrawing(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
          onClick={clear}
        >
          <Eraser className="size-4" />
          Clear
        </Button>
        <Button
          type="button"
          className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white hover:opacity-90"
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              onUseSignature(canvas.toDataURL("image/png"));
            }
          }}
        >
          <PenLine className="size-4" />
          Use Signature
        </Button>
      </div>
    </div>
  );
}
