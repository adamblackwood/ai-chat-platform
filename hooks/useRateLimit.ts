// خطاف حد المعدل: يدير التأخير الزمني بين الرسائل حسب نوع الحساب
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformStore } from '@/stores/platformStore';
import {
  FREE_MESSAGES_BEFORE_DELAY,
  FREE_DELAY_SECONDS,
  PREMIUM_DELAY_SECONDS,
} from '@/utils/constants';

interface UseRateLimitReturn {
  canSend: boolean;
  remainingSeconds: number;
  freeMessagesUsed: number;
  freeMessagesLeft: number;
  isLimited: boolean;
  isPremiumDelay: boolean;
  recordMessage: () => void;
  resetForNewChat: () => void;
}

export function useRateLimit(): UseRateLimitReturn {
  const { role } = useAuthStore();
  const { apiType } = usePlatformStore();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [isPremiumDelay, setIsPremiumDelay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAdmin = role === 'admin';
  const isPremium = role === 'premium';
  const isFree = role === 'free';
  const isPublicApi = apiType === 'global';

  /**
   * مسح المؤقت
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * بدء العد التنازلي
   */
  const startCountdown = useCallback(
    (seconds: number, premium: boolean = false) => {
      clearTimer();
      setRemainingSeconds(seconds);
      setIsLimited(true);
      setIsPremiumDelay(premium);

      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsLimited(false);
            setIsPremiumDelay(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer]
  );

  /**
   * تسجيل رسالة مرسلة
   */
  const recordMessage = useCallback(() => {
    // المدير لا يخضع لحدود
    if (isAdmin) return;

    // المفتاح الخاص لا يخضع لحدود
    if (!isPublicApi) return;

    if (isPremium) {
      // المميز: تأخير 60 ثانية مخفي (يظهر كـ "يكتب...")
      startCountdown(PREMIUM_DELAY_SECONDS, true);
      return;
    }

    if (isFree) {
      const newUsed = freeMessagesUsed + 1;
      setFreeMessagesUsed(newUsed);

      // بعد 4 رسائل مجانية: تأخير 180 ثانية مرئي
      if (newUsed >= FREE_MESSAGES_BEFORE_DELAY) {
        startCountdown(FREE_DELAY_SECONDS, false);
        setFreeMessagesUsed(0); // إعادة العداد بعد التأخير
      }
    }
  }, [isAdmin, isPremium, isFree, isPublicApi, freeMessagesUsed, startCountdown]);

  /**
   * إعادة تعيين لمحادثة جديدة
   */
  const resetForNewChat = useCallback(() => {
    clearTimer();
    setRemainingSeconds(0);
    setFreeMessagesUsed(0);
    setIsLimited(false);
    setIsPremiumDelay(false);
  }, [clearTimer]);

  /**
   * تنظيف المؤقت عند الإزالة
   */
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const canSend = !isLimited || isAdmin || !isPublicApi;
  const freeMessagesLeft = Math.max(0, FREE_MESSAGES_BEFORE_DELAY - freeMessagesUsed);

  return {
    canSend,
    remainingSeconds,
    freeMessagesUsed,
    freeMessagesLeft,
    isLimited,
    isPremiumDelay,
    recordMessage,
    resetForNewChat,
  };
}
