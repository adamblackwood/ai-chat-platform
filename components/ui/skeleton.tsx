"use client";
// مكون الهيكل العظمي للتحميل
import { cn } from "@/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-dark-700", className)} {...props} />;
}

export { Skeleton };
