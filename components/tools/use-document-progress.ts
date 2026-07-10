"use client";

import { useEffect, useState } from "react";

export function useDocumentProgress() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + Math.ceil(Math.random() * 12), 100);

        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setIsProcessing(false);
            setIsComplete(true);
          }, 300);
        }

        return next;
      });
    }, 280);

    return () => window.clearInterval(timer);
  }, [isProcessing]);

  const start = () => {
    setProgress(0);
    setIsComplete(false);
    setIsProcessing(true);
  };

  const reset = () => {
    setProgress(0);
    setIsProcessing(false);
    setIsComplete(false);
  };

  return {
    progress,
    isProcessing,
    isComplete,
    start,
    reset,
  };
}
