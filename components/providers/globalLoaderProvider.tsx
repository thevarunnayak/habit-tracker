"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type LoaderCtx = {
  loading: boolean;
  label?: string;
  showLoader: (label?: string) => void;
  hideLoader: () => void;
};

const GlobalLoaderContext = createContext<LoaderCtx | null>(null);

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);

  const value = useMemo(
    () => ({
      loading,
      label,
      showLoader: (lbl?: string) => {
        setLabel(lbl);
        setLoading(true);
      },
      hideLoader: () => {
        setLoading(false);
        setLabel(undefined);
      },
    }),
    [loading, label]
  );

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const ctx = useContext(GlobalLoaderContext);
  if (!ctx) throw new Error("useGlobalLoader must be used inside GlobalLoaderProvider");
  return ctx;
}
