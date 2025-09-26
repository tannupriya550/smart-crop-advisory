import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-md px-4 py-2 shadow-lg text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white",
        destructive: "bg-red-600 text-white",
        success: "bg-green-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
}

export const Toast = ({ title, description, variant, className }: ToastProps) => {
  return (
    <div className={cn(toastVariants({ variant }), className)}>
      <div className="flex flex-col">
        <span>{title}</span>
        {description && <span className="text-xs opacity-80">{description}</span>}
      </div>
    </div>
  );
};
