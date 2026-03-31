// جولة التعريف: يعرض خطوات الجولة مع تراكب ضبابي وتمييز العنصر المستهدف
'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';
import { useOnboarding } from '@/hooks/useOnboarding';
import { TourStep } from './TourStep';
import {
  PanelRight, LayoutDashboard, Sparkles, Slash,
  Key, Rocket,
} from 'lucide-react';

/**
 * بيانات خطوات الجولة
 */
const STEP_ICONS = [PanelRight, LayoutDashboard, Sparkles, Slash, Key, Rocket];

export function OnboardingTour() {
  const t = useTranslations('onboarding');
  const {
    isActive,
    currentStep,
    totalSteps,
    next,
    previous,
    skip,
    complete,
  } = useOnboarding();

  const handleAction = useCallback(() => {
    if (currentStep === totalSteps - 1) {
      complete();
    } else {
      next();
    }
  }, [currentStep, totalSteps, complete, next]);

  if (!isActive) return null;

  const stepKeys = [
    { title: t('step1_title'), message: t('step1_message') },
    { title: t('step2_title'), message: t('step2_message') },
    { title: t('step3_title'), message: t('step3_message') },
    { title: t('step4_title'), message: t('step4_message') },
    { title: t('step5_title'), message: t('step5_message') },
    { title: t('step6_title'), message: t('step6_message') },
  ];

  const current = stepKeys[currentStep];
  const Icon = STEP_ICONS[currentStep];
  const isLast = currentStep === totalSteps - 1;

  if (!current || !Icon) return null;

  return (
    <>
      {/* التراكب الضبابي */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={skip}
        aria-hidden="true"
      />

      {/* بطاقة الخطوة */}
      <div
        className={cn(
          'fixed z-[101] top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md'
        )}
      >
        <TourStep
          icon={Icon}
          title={current.title}
          message={current.message}
          stepNumber={currentStep + 1}
          totalSteps={totalSteps}
          isFirst={currentStep === 0}
          isLast={isLast}
          onNext={handleAction}
          onPrevious={previous}
          onSkip={skip}
          nextLabel={isLast ? t('start_using') : t('next')}
          previousLabel={t('previous')}
          skipLabel={t('skip')}
        />
      </div>
    </>
  );
}
