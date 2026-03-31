// عداد الرموز: يعرض عدد الرموز المستخدمة بتنسيق مقروء
'use client';

import { memo } from 'react';
import { Hash } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatTokenCount } from '@/utils/formatters';

interface TokenCounterProps {
  tokens: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const TokenCounter = memo(function TokenCounter({
  tokens,
  className,
  showIcon = true,
  size = 'sm',
}: TokenCounterProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md',
        'text-gray-500 dark:text-gray-400',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
      title={`${tokens.toLocaleString()} tokens`}
    >
      {showIcon && (
        <Hash className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      )}
      <span className="font-mono tabular-nums">
        {formatTokenCount(tokens)}
      </span>
    </div>
  );
});
