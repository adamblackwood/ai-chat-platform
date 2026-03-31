// قائمة الشخصيات في الشريط الجانبي: عرض مختصر مع رابط "عرض الكل"
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Sparkles, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePersonaStore } from '@/stores/personaStore';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Link } from '@/i18n/navigation';
import type { Persona } from '@/types/persona';

/**
 * مكون قائمة الشخصيات في الشريط الجانبي
 */
export function PersonaList() {
  const t = useTranslations('sidebar');
  const tPersonas = useTranslations('personas');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createSupabaseBrowserClient();

  const { role } = useAuthStore();
  const { activePersona, setActivePersona } = usePersonaStore();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const loadedRef = useRef(false);

  /**
   * تحميل الشخصيات
   */
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadPersonas = async () => {
      try {
        const { data, error } = await supabase
          .from('personas')
          .select('*')
          .in('type', ['system', 'premium'])
          .eq('is_active', true)
          .order('usage_count', { ascending: false })
          .limit(6);

        if (!error && data) {
          setPersonas(data as Persona[]);
        }
      } catch {
        // تجاهل
      }
    };

    loadPersonas();

    return () => {};
  }, [supabase]);

  const ViewAllChevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-1">
      {/* رأس الشخصيات */}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {t('personas')}
        </span>
        <Link
          href="/personas"
          className="flex items-center gap-0.5 text-[10px] text-primary-500 hover:text-primary-400 transition-colors"
        >
          {t('view_all')}
          <ViewAllChevron className="h-3 w-3" />
        </Link>
      </div>

      {/* قائمة الشخصيات */}
      {personas.map((persona) => {
        const isLocked = persona.type === 'premium' && role === 'free';
        const isActive = activePersona?.id === persona.id;

        return (
          <button
            key={persona.id}
            onClick={() => {
              if (!isLocked) {
                setActivePersona(isActive ? null : persona);
              }
            }}
            disabled={isLocked}
            className={cn(
              'flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-start transition-colors',
              isActive
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : isLocked
                  ? 'text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
            )}
          >
            <Sparkles className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary-500' : '')} />
            <span className="flex-1 text-xs truncate">{persona.name}</span>
            {isLocked && <Lock className="h-3 w-3 shrink-0 text-gray-400" />}
          </button>
        );
      })}
    </div>
  );
}
