"use client";
// مكون الإشعار المنبثق
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5",
  {
    variants: {
      variant: {
        default: "border-dark-700 bg-dark-800 text-white",
        success: "border-green-800 bg-green-950 text-green-200",
        destructive: "border-red-800 bg-red-950 text-red-200",
        warning: "border-yellow-800 bg-yellow-950 text-yellow-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, onClose, children, ...props }, ref) => (
    <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 text-dark-400 transition-colors hover:text-white" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
);
Toast.displayName = "Toast";

function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-sm font-semibold", className)} {...props} />;
}

function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm opacity-80", className)} {...props} />;
}

export { Toast, ToastTitle, ToastDescription, toastVariants };
