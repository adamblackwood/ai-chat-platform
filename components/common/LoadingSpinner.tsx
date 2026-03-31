// مكون مؤشر التحميل: يعرض دائرة دوارة مع نص اختياري
'use client';

import { cn } from '@/utils/cn';

/**
 * خصائص مكون مؤشر التحميل
 */
interface LoadingSpinnerProps {
  /** الحجم */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** النص المرافق */
  text?: string;
  /** أسماء أصناف إضافية */
  className?: string;
  /** ملء الشاشة بالكامل */
  fullScreen?: boolean;
}

/**
 * أحجام المؤشر
 */
const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
} as const;

/**
 * مكون مؤشر التحميل
 */
export function LoadingSpinner({
  size = 'md',
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary-500 border-t-transparent',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
