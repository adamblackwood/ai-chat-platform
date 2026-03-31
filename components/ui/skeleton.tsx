// مكون الهيكل العظمي للتحميل - Shadcn/UI
import { cn } from "@/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-dark-600", className)}
      {...props}
    />
  );
}

export { Skeleton };
