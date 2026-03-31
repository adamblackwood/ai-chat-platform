// عداد الرسائل: يعرض عدد الرسائل المستخدمة من الحد الأقصى مع ألوان تحذيرية
'use client';

import { memo, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { MESSAGE_LIMIT_PER_CHAT } from '@/utils/constants';
import { Tooltip } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

interface MessageCounterProps {
  current: number;
  limit?: number;
  className?: string;
}

export const MessageCounter = memo(function MessageCounter({
  current,
  limit = MESSAGE_LIMIT_PER_CHAT,
  className,
}: MessageCounterProps) {
  const t = useTranslations('chat');

  const colorClass = useMemo(() => {
    const remaining = limit - current;

    if (remaining <= 0) {
      return 'text-red-500 dark:text-red-400 bg-red-500/10';
    }
    if (remaining === 1) {
      return 'text-red-500 dark:text-red-400 bg-red-500/10';
    }
    if (remaining <= 2) {
      return 'text-orange-500 dark:text-orange-400 bg-orange-500/10';
    }
    return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-800';
  }, [current, limit]);

  const isAtLimit = current >= limit;

  const tooltipText = t('messages_used', {
    used: current.toString(),
    total: limit.toString(),
  });

  return (
    <Tooltip content={tooltipText}>
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          colorClass,
          isAtLimit && 'animate-pulse-slow',
          className
        )}
      >
        <MessageSquare className="h-3 w-3" />
        <span className="font-mono tabular-nums">
          {current}/{limit}
        </span>
      </div>
    </Tooltip>
  );
});
