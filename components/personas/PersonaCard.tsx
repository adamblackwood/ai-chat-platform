// بطاقة الشخصية - أيقونة واسم ووصف وتصنيف وتقييم مع أزرار التفاعل
"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Star, Copy, Check, Lock, Sparkles } from "lucide-react";

import PersonaRating from "@/components/personas/PersonaRating";
import PremiumPersonaLock from "@/components/personas/PremiumPersonaLock";
import { usePersonas } from "@/hooks/usePersonas";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { PERSONA_CATEGORIES } from "@/utils/constants";
import { cn } from "@/utils/cn";

import type { Persona } from "@/types/persona";

/**
 * خصائص بطاقة الشخصية
 */
interface PersonaCardProps {
  persona: Persona;
  onUse?: (persona: Persona) => void;
}

/**
 * بطاقة عرض شخصية واحدة
 */
export default function PersonaCard({ persona, onUse }: PersonaCardProps) {
  const t = useTranslations("personas");
  const role = useAuthStore((s) => s.role);
  const activePersona = usePersonaStore((s) => s.activePersona);
  const { setActive, copyPersona } = usePersonas();
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();

  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLock, setShowLock] = useState(false);

  const isActive = activePersona?.id === persona.id;
  const isPremiumLocked = persona.type === "premium" && role === "free";
  const isShared = persona.type === "shared";
  const isFav = isFavorited("persona", persona.id);

  const categoryInfo = PERSONA_CATEGORIES.find(
    (c) => c.value === persona.category
  );

  /**
   * استخدام الشخصية
   */
  const handleUse = useCallback(() => {
    if (isPremiumLocked) {
      setShowLock(true);
      return;
    }

    if (isActive) {
      setActive(null);
    } else {
      setActive(persona);
    }

    if (onUse) {
      onUse(persona);
    }
  }, [isPremiumLocked, isActive, persona, setActive, onUse]);

  /**
   * نسخ الشخصية
   */
  const handleCopy = useCallback(async () => {
    setIsCopying(true);
    try {
      const result = await copyPersona(persona);
      if (result) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // صامت
    } finally {
      setIsCopying(false);
    }
  }, [persona, copyPersona]);

  /**
   * تبديل المفضلة
   */
  const handleFavoriteToggle = useCallback(async () => {
    if (isFav) {
      await removeFavorite("persona", persona.id);
    } else {
      await addFavorite("persona", persona.id);
    }
  }, [isFav, persona.id, addFavorite, removeFavorite]);

  return (
    <>
      <div
        className={cn(
          "relative rounded-xl p-4",
          "bg-white dark:bg-dark-card",
          "border-2 transition-all duration-200",
          "hover:shadow-md dark:hover:shadow-lg",
          isActive
            ? "border-primary shadow-sm shadow-primary/10"
            : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600"
        )}
      >
        {/* شارة النوع */}
        {persona.type === "premium" && (
          <div className="absolute top-2 end-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-semibold">
              <Sparkles className="h-2.5 w-2.5" />
              Premium
            </span>
          </div>
        )}

        {/* الرأس: أيقونة + اسم + تصنيف */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "flex-shrink-0 h-12 w-12 rounded-xl",
              "bg-primary/10 dark:bg-primary/20",
              "flex items-center justify-center text-2xl"
            )}
          >
            {persona.icon_url ?? "🎭"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {persona.name}
            </h3>
            {categoryInfo && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {categoryInfo.icon} {categoryInfo.labelAr}
              </span>
            )}
          </div>
        </div>

        {/* الوصف */}
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
          {persona.description}
        </p>

        {/* التقييم (للمشتركة فقط) */}
        {(isShared || persona.type === "premium") && persona.rating_count > 0 && (
          <div className="mb-3">
            <PersonaRating
              personaId={persona.id}
              averageRating={persona.average_rating}
              ratingCount={persona.rating_count}
              compact
            />
          </div>
        )}

        {/* الأزرار */}
        <div className="flex items-center gap-2">
          {/* زر الاستخدام */}
          <button
            onClick={handleUse}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5",
              "px-3 py-2 rounded-lg text-xs font-medium",
              "transition-colors",
              isActive
                ? "bg-primary text-white"
                : isPremiumLocked
                ? "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {isPremiumLocked && <Lock className="h-3 w-3" />}
            <span>
              {isActive ? t("use_persona") : isPremiumLocked ? t("upgrade_prompt").slice(0, 15) + "..." : t("use_persona")}
            </span>
          </button>

          {/* نسخ (مجتمع/مميز) */}
          {(isShared || persona.type === "system") && (
            <button
              onClick={handleCopy}
              disabled={isCopying}
              aria-label={t("copy_persona")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-gray-400 hover:text-primary",
                "hover:bg-gray-100 dark:hover:bg-dark-hover",
                "disabled:opacity-50"
              )}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}

          {/* المفضلة */}
          <button
            onClick={handleFavoriteToggle}
            aria-label="Toggle favorite"
            className={cn(
              "p-2 rounded-lg transition-colors",
              isFav
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500",
              "hover:bg-gray-100 dark:hover:bg-dark-hover"
            )}
          >
            <Star
              className={cn("h-4 w-4", isFav && "fill-yellow-500")}
            />
          </button>
        </div>
      </div>

      {/* مكون القفل المميز */}
      {showLock && (
        <PremiumPersonaLock
          persona={persona}
          onClose={() => setShowLock(false)}
        />
      )}
    </>
  );
}
