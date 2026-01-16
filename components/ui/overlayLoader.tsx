// components/ui/overlay-loader.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function OverlayLoader({
  show,
  label = "Loading...",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
