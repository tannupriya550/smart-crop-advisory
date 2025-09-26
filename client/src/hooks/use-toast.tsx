// client/src/hooks/use-toast.tsx
import { useState, useCallback } from "react";

export interface ToastMessage {
  id?: number;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: ToastMessage) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, variant: "default", ...message }]);

    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const ToastComponent = (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md shadow-lg p-3 text-sm transition
            ${t.variant === "destructive" ? "bg-red-600 text-white" : ""}
            ${t.variant === "success" ? "bg-green-600 text-white" : ""}
            ${!t.variant || t.variant === "default" ? "bg-gray-800 text-white" : ""}
          `}
        >
          {t.title && <p className="font-bold">{t.title}</p>}
          {t.description && <p>{t.description}</p>}
        </div>
      ))}
    </div>
  );

  return { toast, ToastComponent };
}
