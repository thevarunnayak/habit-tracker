"use client";

import OverlayLoader from "@/components/ui/overlayLoader";
import { useGlobalLoader } from "./globalLoaderProvider";

export default function OverlayLoaderConsumer() {
  const { loading, label } = useGlobalLoader();

  return <OverlayLoader show={loading} label={label} />;
}
