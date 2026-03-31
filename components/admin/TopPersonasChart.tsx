// أكثر الشخصيات استخداماً - قائمة مرتبة مع أشرطة بيانية
"use client";

import { useState, useEffect, useRef } from "react";

import { getSupabaseBrowser } from "@/lib/supabase-client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/utils/cn";

import type { Persona } from "@/types/persona";

/**
 * رسم بياني لأكثر 10 شخصيات استخداماً
 */
export default function TopPersonasChart() {
  const supabase = getSupabaseBrowser();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("personas")
          .select("id, name, icon_url, usage_count, type")
          .eq("is_active", true)
          .order("usage_count", { ascending: false })
          .limit(10);

        if (isMountedRef.current) {
          setPersonas((data as Persona[]) ?? []);
        }
      } catch {
        // صامت
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetch();
    return () => { isMountedRef.current = false; };
  }, [supabase]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>;
  }

  if (personas.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">لا توجد بيانات</p>;
  }

  const maxCount = Math.max(...personas.map((p) => p.usage_count), 1);

  return (
    <div className="space-y-3">
      {personas.map((persona, index) => (
        <div key={persona.id} className="flex items-center gap-3">
          {/* الترتيب */}
          <span
            className={cn(
              "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              index < 3
                ? "bg-primary/10 text-primary"
                : "bg-gray-100 dark:bg-dark-surface text-gray-500"
            )}
          >
            {index + 1}
          </span>

          {/* الأيقونة */}
          <span className="text-base flex-shrink-0">{persona.icon_url ?? "🎭"}</span>

          {/* الاسم والشريط */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
              {persona.name}
            </p>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                style={{ width: `${(persona.usage_count / maxCount) * 100}%` }}
              />
            </div>
          </div>

          {/* العدد */}
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 tabular-nums">
            {persona.usage_count}
          </span>
        </div>
      ))}
    </div>
  );
}
