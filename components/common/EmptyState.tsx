// مكون الحالة الفارغة: يعرض أيقونة وعنوان ووصف مع زر إجراء اختياري
'use client';

import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * خصائص مكون الحالة الفارغة
 */
interface EmptyStateProps {
  /** الأيقونة */
  icon: LucideIcon;
  /** العنوان */
  title: string;
  /** الوصف */
  description?: string;
  /** نص زر الإجراء */
  actionLabel?: string;
  /** دالة الإجراء */
  onAction?: () => void;
  /** أسماء أصناف إضافية */
  className?: string;
}

/**
 * مكون الحالة الفارغة
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 space-y-4',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-800">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
