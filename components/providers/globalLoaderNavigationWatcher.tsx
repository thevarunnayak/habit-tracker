// components/providers/globalLoaderNavigationWatcher.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGlobalLoader } from "./globalLoaderProvider";

export default function GlobalLoaderNavigationWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideLoader } = useGlobalLoader();

  useEffect(() => {
    hideLoader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return null;
}
