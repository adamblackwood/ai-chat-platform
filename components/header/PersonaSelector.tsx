// محدد الشخصية: عرض الشخصية النشطة مع إمكانية التبديل السريع
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePersonaStore } from '@/stores/personaStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Persona } from '@/types/persona';

export function PersonaSelector() {
  const t = useTranslations('header');
  const supabase = createSupabaseBrowserClient();
  const { activePersona, setActivePersona, clearPersona } = usePersonaStore();

  const [open, setOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      try {
        const { data } = await supabase
          .from('personas')
          .select('*')
          .in('type', ['system', 'premium'])
          .eq('is_active', true)
          .order('usage_count', { ascending: false })
          .limit(10);

        if (data) {
          setPersonas(data as Persona[]);
        }
      } catch {
        // تجاهل
      }
    };

    load();
    return () => {};
  }, [supabase]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger onClick={() => setOpen(!open)}>
        <button
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
            activePersona
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/30'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 border border-transparent'
          )}
          aria-label={t('switch_persona')}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[100px] text-xs font-medium">
            {activePersona?.name ?? t('no_persona')}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      {open && (
        <DropdownMenuContent align="end" className="min-w-[220px] max-h-[300px] overflow-y-auto custom-scrollbar">
          <DropdownMenuLabel>{t('switch_persona')}</DropdownMenuLabel>

          {/* خيار بدون شخصية */}
          <DropdownMenuItem
            onClick={() => {
              clearPersona();
              setOpen(false);
            }}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <X className="h-3.5 w-3.5 text-gray-400" />
              <span>{t('no_persona')}</span>
            </div>
            {!activePersona && <Check className="h-4 w-4 text-primary-500" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* قائمة الشخصيات */}
          {personas.map((persona) => (
            <DropdownMenuItem
              key={persona.id}
              onClick={() => {
                setActivePersona(persona);
                setOpen(false);
              }}
              className="justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                <div className="min-w-0">
                  <p className="text-sm truncate">{persona.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {persona.description.substring(0, 40)}
                  </p>
                </div>
              </div>
              {activePersona?.id === persona.id && (
                <Check className="h-4 w-4 text-primary-500 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
