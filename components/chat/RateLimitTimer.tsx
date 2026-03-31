// مؤقت حد المعدل: عداد تنازلي مع تلميح استخدام المفتاح الخاص
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Key } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDuration } from '@/utils/formatters';

interface RateLimitTimerProps {
  seconds: number;
  isVisible: boolean;
  onComplete: () => void;
  showUpgradeHint?: boolean;
  className?: string;
}

export const RateLimitTimer = memo(function RateLimitTimer({
  seconds,
  isVisible,
  onComplete,
  showUpgradeHint = true,
  className,
}: RateLimitTimerProps) {
  const t = useTranslations('chat');
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isVisible || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, remaining, onComplete]);

  if (!isVisible || remaining <= 0) return null;

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl',
        'border border-orange-200 dark:border-orange-800/30',
        'bg-orange-50 dark:bg-orange-900/10 p-5',
        className
      )}
    >
      <Clock className="h-8 w-8 text-orange-500 animate-pulse" />

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
          {t('rate_limit_wait')}
        </p>
        <p className="text-3xl font-mono font-bold text-orange-600 dark:text-orange-400 tabular-nums">
          {formatDuration(remaining)}
        </p>
      </div>

      {/* شريط التقدم */}
      <div className="w-full max-w-xs h-2 rounded-full bg-orange-200 dark:bg-orange-800/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* تلميح */}
      {showUpgradeHint && (
        <div className="flex items-center gap-2 text-xs text-orange-500/80 dark:text-orange-400/80">
          <Key className="h-3 w-3" />
          <span>{t('rate_limit_tip')}</span>
        </div>
      )}
    </div>
  );
});
