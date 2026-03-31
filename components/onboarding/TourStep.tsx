// خطوة الجولة: بطاقة تعريفية مع عنوان ورسالة وأيقونة وأزرار تنقل
'use client';

import { memo } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

interface TourStepProps {
  icon: LucideIcon;
  title: string;
  message: string;
  stepNumber: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  nextLabel: string;
  previousLabel: string;
  skipLabel: string;
}

export const TourStep = memo(function TourStep({
  icon: Icon,
  title,
  message,
  stepNumber,
  totalSteps,
  isFirst,
  isLast,
  onNext,
  onPrevious,
  onSkip,
  nextLabel,
  previousLabel,
  skipLabel,
}: TourStepProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="rounded-2xl border border-primary-500/30 bg-dark-900 shadow-2xl shadow-primary-500/10 overflow-hidden animate-fade-in">
      {/* شريط التقدم */}
      <div className="h-1 bg-dark-700">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>

      {/* المحتوى */}
      <div className="p-6 space-y-4">
        {/* رأس مع إغلاق */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">{title}</h3>
              <span className="text-xs text-gray-400 font-mono">
                {stepNumber}/{totalSteps}
              </span>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-200 hover:bg-dark-700 transition-colors"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* الرسالة */}
        <p className="text-sm text-gray-300 leading-relaxed">{message}</p>

        {/* نقاط التقدم */}
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={`dot-${i}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === stepNumber - 1
                  ? 'w-6 bg-primary-500'
                  : i < stepNumber
                    ? 'w-1.5 bg-primary-500/50'
                    : 'w-1.5 bg-dark-600'
              )}
            />
          ))}
        </div>

        {/* الأزرار */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="ghost" size="sm" onClick={onPrevious}>
                {isRTL ? (
                  <ChevronRight className="h-4 w-4 me-1" />
                ) : (
                  <ChevronLeft className="h-4 w-4 me-1" />
                )}
                {previousLabel}
              </Button>
            )}
            {!isLast && (
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-gray-400">
                {skipLabel}
              </Button>
            )}
          </div>

          <Button size="sm" onClick={onNext} className={cn(isLast && 'gap-2')}>
            {nextLabel}
            {!isLast && (
              isRTL ? (
                <ChevronLeft className="h-4 w-4 ms-1" />
              ) : (
                <ChevronRight className="h-4 w-4 ms-1" />
              )
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});
