"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export function useToast() {
  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
    ) => {
      if (type === "success") toast.success(message);
      if (type === "error") toast.error(message);
      if (type === "warning") toast.warning(message);
      if (type === "info") toast(message);
    },
    [],
  );

  return useMemo(() => ({ showToast }), [showToast]);
}
