"use client";

import {
  ArrowDown,
  ArrowUp,
  RotateCcw,
  RotateCw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfPageState } from "@/types/pdf";

interface PageManagerPanelProps {
  pageStates: PdfPageState[];
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  onDeletePage: (pageNumber: number) => void;
  onRotatePage: (pageNumber: number, direction: "cw" | "ccw") => void;
  onMovePage: (pageNumber: number, direction: "up" | "down") => void;
}

export function PageManagerPanel({
  pageStates,
  currentPage,
  onPageChange,
  onDeletePage,
  onRotatePage,
  onMovePage,
}: PageManagerPanelProps) {
  const orderedPages = [...pageStates].sort((left, right) => left.order - right.order);
  const activePages = orderedPages.filter((page) => !page.deleted);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Pages</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Delete, rotate, and reorder pages before export.
        </p>
      </div>
      <div className="max-h-96 space-y-2 overflow-auto pr-1">
        {orderedPages.map((pageState) => {
          const activeIndex = activePages.findIndex(
            (page) => page.pageNumber === pageState.pageNumber
          );
          const isCurrent = currentPage === pageState.pageNumber;
          const isDeleted = pageState.deleted;

          return (
            <div
              key={pageState.pageNumber}
              className={cn(
                "rounded-lg border p-3 transition",
                isCurrent
                  ? "border-cyan-300/45 bg-cyan-300/10"
                  : "border-white/12 bg-[#050816]/60",
                isDeleted && "opacity-45"
              )}
            >
              <button
                type="button"
                disabled={isDeleted}
                onClick={() => onPageChange(pageState.pageNumber)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-medium text-white">
                  Page {pageState.pageNumber}
                </span>
                <span className="text-xs text-slate-400">
                  {isDeleted ? "Deleted" : `${pageState.rotation} deg`}
                </span>
              </button>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isDeleted || activeIndex <= 0}
                  onClick={() => onMovePage(pageState.pageNumber, "up")}
                  className="size-8 border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
                  aria-label="Move page up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isDeleted || activeIndex === activePages.length - 1}
                  onClick={() => onMovePage(pageState.pageNumber, "down")}
                  className="size-8 border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
                  aria-label="Move page down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isDeleted}
                  onClick={() => onRotatePage(pageState.pageNumber, "ccw")}
                  className="size-8 border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
                  aria-label="Rotate page counter-clockwise"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isDeleted}
                  onClick={() => onRotatePage(pageState.pageNumber, "cw")}
                  className="size-8 border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
                  aria-label="Rotate page clockwise"
                >
                  <RotateCw className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isDeleted || activePages.length <= 1}
                  onClick={() => onDeletePage(pageState.pageNumber)}
                  className="size-8 border-rose-300/20 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
                  aria-label="Delete page"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
