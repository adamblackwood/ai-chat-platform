// خطاف جولة التعريف: يدير خطوات الجولة التعريفية للمستخدمين الجدد
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const TOTAL_STEPS = 6;

interface UseOnboardingReturn {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  next: () => void;
  previous: () => void;
  skip: () => void;
  complete: () => Promise<void>;
  restart: () => void;
  goToStep: (step: number) => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuthStore();
  const { tourActive, tourStep, setTourActive, setTourStep } = useUIStore();
  const checkedRef = useRef(false);

  /**
   * التحقق من حالة الجولة عند أول تحميل
   */
  useEffect(() => {
    if (!user || checkedRef.current) return;
    checkedRef.current = true;

    if (!user.onboarding_completed) {
      setTourActive(true);
      setTourStep(0);
    }

    return () => {};
  }, [user, setTourActive, setTourStep]);

  /**
   * الانتقال للخطوة التالية
   */
  const next = useCallback(() => {
    if (tourStep < TOTAL_STEPS - 1) {
      setTourStep(tourStep + 1);
    }
  }, [tourStep, setTourStep]);

  /**
   * الرجوع للخطوة السابقة
   */
  const previous = useCallback(() => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  }, [tourStep, setTourStep]);

  /**
   * تخطي الجولة
   */
  const skip = useCallback(async () => {
    setTourActive(false);
    setTourStep(0);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      } catch {
        // تجاهل
      }
    }
  }, [user, supabase, setTourActive, setTourStep]);

  /**
   * إكمال الجولة
   */
  const complete = useCallback(async () => {
    setTourActive(false);
    setTourStep(0);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      } catch {
        // تجاهل
      }
    }
  }, [user, supabase, setTourActive, setTourStep]);

  /**
   * إعادة تشغيل الجولة
   */
  const restart = useCallback(() => {
    setTourActive(true);
    setTourStep(0);
  }, [setTourActive, setTourStep]);

  /**
   * الانتقال لخطوة محددة
   */
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < TOTAL_STEPS) {
        setTourStep(step);
      }
    },
    [setTourStep]
  );

  return {
    isActive: tourActive,
    currentStep: tourStep,
    totalSteps: TOTAL_STEPS,
    next,
    previous,
    skip,
    complete,
    restart,
    goToStep,
  };
}
