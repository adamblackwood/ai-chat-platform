// مكون رسالة الخطأ - أيقونة حمراء ونص مع خيار إعادة المحاولة
"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * خصائص رسالة الخطأ
 */
interface ErrorMessageProps {
  /** نص رسالة الخطأ */
  message: string;
  /** عنوان الخطأ (اختياري) */
  title?: string;
  /** دالة إعادة المحاولة (اختياري) */
  onRetry?: () => void;
  /** نص زر إعادة المحاولة */
  retryLabel?: string;
  /** حجم المكون */
  size?: "sm" | "md" | "lg";
  /** أصناف CSS إضافية */
  className?: string;
}

/**
 * رسالة خطأ موحدة مع خيار إعادة المحاولة
 */
export default function ErrorMessage({
  message,
  title,
  onRetry,
  retryLabel = "حاول مرة أخرى",
  size = "md",
  className,
}: ErrorMessageProps) {
  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={cn(
        "rounded-lg border",
        "border-red-200 dark:border-red-800/50",
        "bg-red-50 dark:bg-red-900/20",
        sizeClasses[size],
        "animate-fade-in",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={cn(
            "text-red-500 dark:text-red-400 shrink-0 mt-0.5",
            iconSizes[size]
          )}
        />
        <div className="flex-1 space-y-1">
          {title && (
            <h4
              className={cn(
                "font-medium text-red-800 dark:text-red-300",
                size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
              )}
            >
              {title}
            </h4>
          )}
          <p
            className={cn(
              "text-red-600 dark:text-red-400",
              size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-sm"
            )}
          >
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "mt-3 flex items-center gap-1.5",
            "font-medium text-red-600 dark:text-red-400",
            "hover:text-red-700 dark:hover:text-red-300",
            "transition-colors",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          <RefreshCw className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
