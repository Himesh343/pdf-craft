"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  onPageChange: (page: number) => void;
}

export function PageNavigation({
  currentPage,
  totalPages,
  visiblePages,
  onPageChange,
}: PageNavigationProps) {
  const currentIndex = visiblePages.indexOf(currentPage);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < visiblePages.length - 1;

  return (
    <div className="space-y-3 rounded-xl border border-white/12 bg-[#050816]/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(visiblePages[currentIndex - 1])}
          className="border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center text-sm text-slate-300">
          <p className="font-medium text-white">Page {currentPage}</p>
          <p>{totalPages ? `${visiblePages.length} of ${totalPages} pages active` : "No PDF selected"}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canGoNext}
          onClick={() => onPageChange(visiblePages[currentIndex + 1])}
          className="border-white/12 bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <Input
        type="number"
        min={1}
        max={totalPages || 1}
        value={currentPage || 1}
        disabled={!totalPages}
        onChange={(event) => {
          const nextPage = Number(event.target.value);
          if (visiblePages.includes(nextPage)) {
            onPageChange(nextPage);
          }
        }}
        className="h-10 border-white/12 bg-[#050816]/80 text-white"
      />
    </div>
  );
}
