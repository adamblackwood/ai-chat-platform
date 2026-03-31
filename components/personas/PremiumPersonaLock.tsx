// قفل الشخصية المميزة - تجربة مجانية أو ترقية
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Crown, X, Zap, Ticket, Loader2 } from "lucide-react";

import { usePersonas } from "@/hooks/usePersonas";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";

import type { Persona } from "@/types/persona";

/**
 * خصائص مكون القفل المميز
 */
interface PremiumPersonaLockProps {
  persona: Persona;
  onClose: () => void;
}

/**
 * مكون قفل الشخصية المميزة - يعرض خيارات التجربة والترقية
 */
export default function PremiumPersonaLock({
  persona,
  onClose,
}: PremiumPersonaLockProps) {
  const t = useTranslations("personas");
  const tSettings = useTranslations("settings");
  const router = useRouter();
  const locale = useUIStore((s) => s.locale);
  const { checkTrialUsed, useTrialMessage, setActive } = usePersonas();

  const [trialUsed, setTrialUsed] = useState<boolean | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const isMountedRef = useRef(true);

  // التحقق من استخدام التجربة
  useEffect(() => {
    isMountedRef.current = true;

    checkTrialUsed(persona.id).then((used) => {
      if (isMountedRef.current) setTrialUsed(used);
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [persona.id, checkTrialUsed]);

  /**
   * تفعيل الرسالة التجريبية
   */
  const handleTrialActivation = useCallback(async () => {
    setIsActivating(true);
    try {
      const success = await useTrialMessage(persona.id);
      if (success) {
        setActive(persona);
        onClose();
      } else {
        if (isMountedRef.current) setTrialUsed(true);
      }
    } catch {
      // صامت
    } finally {
      if (isMountedRef.current) setIsActivating(false);
    }
  }, [persona, useTrialMessage, setActive, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* خلفية معتمة */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* المحتوى */}
      <div
        className={cn(
          "relative w-full max-w-sm mx-4",
          "bg-white dark:bg-dark-card",
          "rounded-2xl shadow-2xl",
          "border border-gray-200 dark:border-dark-border",
          "p-6",
          "animate-fade-in"
        )}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-5">
          {/* الأيقونة */}
          <div
            className={cn(
              "h-16 w-16 rounded-2xl",
              "bg-gradient-to-br from-yellow-400 to-yellow-600",
              "flex items-center justify-center",
              "shadow-lg shadow-yellow-500/30"
            )}
          >
            <Crown className="h-8 w-8 text-white" />
          </div>

          {/* العنوان */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {persona.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("upgrade_prompt")}
            </p>
          </div>

          {/* الخيارات */}
          <div className="w-full space-y-3">
            {/* تجربة مجانية */}
            {trialUsed === false && (
              <button
                onClick={handleTrialActivation}
                disabled={isActivating}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "px-4 py-3 rounded-xl text-sm font-medium",
                  "bg-gradient-to-r from-primary to-secondary text-white",
                  "hover:opacity-90 disabled:opacity-50 transition-opacity"
                )}
              >
                {isActivating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span>{t("trial_message_button")}</span>
              </button>
            )}

            {/* تم استخدام التجربة */}
            {trialUsed === true && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                {t("trial_used")}
              </p>
            )}

            {/* جاري التحقق */}
            {trialUsed === null && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}

            {/* فاصل */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200 dark:border-dark-border" />
              <span className="text-xs text-gray-400">أو</span>
              <div className="flex-1 border-t border-gray-200 dark:border-dark-border" />
            </div>

            {/* ترقية عبر التجربة المجانية */}
            <button
              onClick={() => {
                onClose();
                router.push(`/${locale}/settings`);
              }}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "px-4 py-3 rounded-xl text-sm font-medium",
                "border border-primary text-primary",
                "hover:bg-primary/5 transition-colors"
              )}
            >
              <Crown className="h-4 w-4" />
              <span>{tSettings("trial_button")}</span>
            </button>

            {/* إدخال رمز دعوة */}
            <button
              onClick={() => {
                onClose();
                router.push(`/${locale}/settings`);
              }}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "px-4 py-3 rounded-xl text-sm font-medium",
                "border border-gray-300 dark:border-dark-border",
                "text-gray-600 dark:text-gray-400",
                "hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
              )}
            >
              <Ticket className="h-4 w-4" />
              <span>{tSettings("invite_code_label")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
