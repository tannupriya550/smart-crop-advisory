// client/src/components/ui/toaster.tsx
"use client";

import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { ToastComponent } = useToast();

  // Render whatever your toast hook exposes
  return <>{ToastComponent}</>;
}
