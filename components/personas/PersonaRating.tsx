// تقييم الشخصية - 1 إلى 5 نجوم قابلة للنقر مع متوسط وعدد
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Star } from "lucide-react";

import { usePersonas } from "@/hooks/usePersonas";
import { cn } from "@/utils/cn";

/**
 * خصائص تقييم الشخصية
 */
interface PersonaRatingProps {
  personaId: string;
  averageRating: number;
  ratingCount: number;
  compact?: boolean;
  readOnly?: boolean;
}

/**
 * مكون تقييم الشخصية بالنجوم
 */
export default function PersonaRating({
  personaId,
  averageRating,
  ratingCount,
  compact = false,
  readOnly = false,
}: PersonaRatingProps) {
  const { ratePersona, getUserRating } = usePersonas();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  // جلب تقييم المستخدم عند التحميل
  useEffect(() => {
    isMountedRef.current = true;

    if (!readOnly) {
      getUserRating(personaId).then((rating) => {
        if (isMountedRef.current) setUserRating(rating);
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [personaId, getUserRating, readOnly]);

  /**
   * معالجة النقر على نجمة
   */
  const handleRate = useCallback(
    async (rating: number) => {
      if (readOnly || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const success = await ratePersona(personaId, rating);
        if (success && isMountedRef.current) {
          setUserRating(rating);
        }
      } catch {
        // صامت
      } finally {
        if (isMountedRef.current) setIsSubmitting(false);
      }
    },
    [personaId, ratePersona, readOnly, isSubmitting]
  );

  const displayRating = hoveredStar ?? userRating ?? averageRating;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= Math.round(displayRating);

            return (
              <button
                key={i}
                onClick={() => handleRate(starValue)}
                onMouseEnter={() => !readOnly && setHoveredStar(starValue)}
                onMouseLeave={() => setHoveredStar(null)}
                disabled={readOnly || isSubmitting}
                aria-label={`Rate ${starValue} stars`}
                className={cn(
                  "transition-colors disabled:cursor-default",
                  !readOnly && "cursor-pointer hover:scale-110"
                )}
              >
                <Star
                  className={cn(
                    "h-3 w-3",
                    isFilled
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  )}
                />
              </button>
            );
          })}
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          ({ratingCount})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(displayRating);
          const isUserRated = userRating !== null && starValue <= userRating;

          return (
            <button
              key={i}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => !readOnly && setHoveredStar(starValue)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={readOnly || isSubmitting}
              aria-label={`Rate ${starValue} stars`}
              className={cn(
                "p-0.5 transition-all",
                !readOnly && "cursor-pointer hover:scale-125",
                "disabled:cursor-default"
              )}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  isFilled
                    ? isUserRated
                      ? "text-primary fill-primary"
                      : "text-yellow-500 fill-yellow-500"
                    : "text-gray-300 dark:text-gray-600"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">{averageRating.toFixed(1)}</span>
        <span className="text-xs ms-1">({ratingCount})</span>
      </div>
    </div>
  );
}
