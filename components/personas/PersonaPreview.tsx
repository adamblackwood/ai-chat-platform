// معاينة الشخصية - عرض البطاقة قبل الحفظ مع تأكيد
"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

import { PERSONA_CATEGORIES } from "@/utils/constants";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";

import type { PersonaCategory } from "@/types/persona";

/**
 * خصائص المعاينة
 */
interface PersonaPreviewProps {
  name: string;
  description: string;
  category: PersonaCategory;
  iconUrl: string;
  systemPrompt: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * معاينة الشخصية قبل الحفظ
 */
export default function PersonaPreview({
  name,
  description,
  category,
  iconUrl,
  systemPrompt,
  onClose,
  onConfirm,
}: PersonaPreviewProps) {
  const t = useTranslations("personas");
  const tCommon = useTranslations("common");
  const locale = useUIStore((s) => s.locale);

  const categoryInfo = PERSONA_CATEGORIES.find((c) => c.value === category);
  const truncatedPrompt =
    systemPrompt.length > 100
      ? systemPrompt.slice(0, 100) + "..."
      : systemPrompt;

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
          "relative w-full max-w-md mx-4",
          "bg-white dark:bg-dark-card",
          "rounded-2xl shadow-2xl",
          "border border-gray-200 dark:border-dark-border",
          "overflow-hidden",
          "animate-fade-in"
        )}
      >
        {/* الرأس المتدرج */}
        <div
          className={cn(
            "bg-gradient-to-br from-primary/10 to-secondary/10",
            "dark:from-primary/20 dark:to-secondary/20",
            "px-6 py-8"
          )}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className={cn(
                "h-16 w-16 rounded-2xl",
                "bg-white dark:bg-dark-card",
                "shadow-lg",
                "flex items-center justify-center text-3xl"
              )}
            >
              {iconUrl}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {name || "..."}
              </h3>
              {categoryInfo && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {categoryInfo.icon}{" "}
                  {locale === "ar" ? categoryInfo.labelAr : categoryInfo.labelEn}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* الوصف و System Prompt */}
        <div className="px-6 py-5 space-y-4">
          {/* الوصف */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">
              {t("description_label")}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {description || "..."}
            </p>
          </div>

          {/* معاينة System Prompt */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">
              {t("system_prompt_label")}
            </p>
            <div
              className={cn(
                "p-3 rounded-lg",
                "bg-gray-50 dark:bg-dark-surface",
                "border border-gray-100 dark:border-dark-border"
              )}
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
                {truncatedPrompt || "..."}
              </p>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div
          className={cn(
            "flex items-center gap-3 px-6 py-4",
            "border-t border-gray-200 dark:border-dark-border"
          )}
        >
          <button
            onClick={onClose}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "px-4 py-2.5 rounded-lg text-sm font-medium",
              "border border-gray-300 dark:border-dark-border",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-dark-hover",
              "transition-colors"
            )}
          >
            <X className="h-4 w-4" />
            <span>{tCommon("cancel")}</span>
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "px-4 py-2.5 rounded-lg text-sm font-medium",
              "bg-primary hover:bg-primary-600 text-white",
              "transition-colors"
            )}
          >
            <Check className="h-4 w-4" />
            <span>{t("save")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
