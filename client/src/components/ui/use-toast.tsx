import { useState, useCallback } from "react";
import { Toast } from "./toast";

export function useToast() {
  const [toast, setToast] = useState<{
    title: string;
    description?: string;
    variant?: "default" | "destructive" | "success";
  } | null>(null);

  const showToast = useCallback(
    (options: { title: string; description?: string; variant?: "default" | "destructive" | "success" }) => {
      setToast(options);

      // Auto hide after 3s
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const ToastComponent = toast ? (
    <Toast
      title={toast.title}
      description={toast.description}
      variant={toast.variant}
    />
  ) : null;

  return {
    toast: showToast,
    ToastComponent,
  };
}
