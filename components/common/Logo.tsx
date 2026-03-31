// مكون الشعار: يعرض شعار التطبيق مع الاسم
'use client';

import { cn } from '@/utils/cn';
import { Bot } from 'lucide-react';

/**
 * خصائص مكون الشعار
 */
interface LogoProps {
  /** الحجم */
  size?: 'sm' | 'md' | 'lg';
  /** إظهار النص */
  showText?: boolean;
  /** أسماء أصناف إضافية */
  className?: string;
}

/**
 * أحجام الشعار
 */
const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} as const;

const textSizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
} as const;

/**
 * مكون الشعار
 */
export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-lg" />
        <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-2">
          <Bot className={cn('text-white', iconSizes[size])} />
        </div>
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent',
            textSizes[size]
          )}
        >
          {process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat'}
        </span>
      )}
    </div>
  );
}
