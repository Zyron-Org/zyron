"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/lib/theme-context";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      richColors
      closeButton
    />
  );
}
