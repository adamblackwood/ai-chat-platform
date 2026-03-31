// أوامر مائلة: قائمة منبثقة فوق حقل الإدخال للشخصيات والأوامر السريعة
'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Sparkles, Lock, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SLASH_COMMANDS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';
import { usePersonaStore } from '@/stores/personaStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Persona } from '@/types/persona';

interface SlashCommandsProps {
  filter: string;
  selectedIndex: number;
  onSelect: (personaId: string) => void;
  visible: boolean;
}

interface CommandItem {
  id: string;
  command: string;
  label: string;
  description: string;
  section: 'system' | 'premium' | 'custom' | 'action';
  locked: boolean;
}

export const SlashCommands = memo(function SlashCommands({
  filter,
  selectedIndex,
  onSelect,
  visible,
}: SlashCommandsProps) {
  const locale = useLocale();
  const { role } = useAuthStore();
  const { clearPersona } = usePersonaStore();
  const supabase = createSupabaseBrowserClient();

  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [premiumPersonas, setPremiumPersonas] = useState<Persona[]>([]);
  const loadedRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  // تحميل الشخصيات المخصصة والمميزة
  useEffect(() => {
    if (loadedRef.current || !visible) return;
    loadedRef.current = true;

    const load = async () => {
      try {
        const { data: custom } = await supabase
          .from('personas')
          .select('*')
          .eq('type', 'custom')
          .eq('is_active', true)
          .limit(10);

        const { data: premium } = await supabase
          .from('personas')
          .select('*')
          .eq('type', 'premium')
          .eq('is_active', true)
          .limit(10);

        if (custom) setCustomPersonas(custom as Persona[]);
        if (premium) setPremiumPersonas(premium as Persona[]);
      } catch {
        // تجاهل
      }
    };

    load();
    return () => {};
  }, [visible, supabase]);

  // بناء قائمة الأوامر الموحدة
  const allItems: CommandItem[] = [];

  // أوامر النظام المدمجة
  SLASH_COMMANDS.forEach((cmd) => {
    allItems.push({
      id: cmd.personaId,
      command: cmd.command,
      label: locale === 'ar' ? cmd.labelAr : cmd.labelEn,
      description: locale === 'ar' ? cmd.description_ar : cmd.description_en,
      section: 'system',
      locked: false,
    });
  });

  // الشخصيات المميزة
  premiumPersonas.forEach((p) => {
    allItems.push({
      id: p.id,
      command: `/${p.name.replace(/\s+/g, '_').toLowerCase().substring(0, 12)}`,
      label: p.name,
      description: p.description.substring(0, 60),
      section: 'premium',
      locked: role === 'free',
    });
  });

  // الشخصيات المخصصة
  customPersonas.forEach((p) => {
    allItems.push({
      id: p.id,
      command: `/${p.name.replace(/\s+/g, '_').toLowerCase().substring(0, 12)}`,
      label: p.name,
      description: p.description.substring(0, 60),
      section: 'custom',
      locked: false,
    });
  });

  // أمر إلغاء الشخصية
  allItems.push({
    id: '__none__',
    command: '/none',
    label: locale === 'ar' ? 'بدون شخصية' : 'No Persona',
    description: locale === 'ar' ? 'إزالة الشخصية النشطة' : 'Remove active persona',
    section: 'action',
    locked: false,
  });

  // التصفية
  const filtered = allItems.filter(
    (item) =>
      item.command.substring(1).startsWith(filter) ||
      item.label.toLowerCase().includes(filter.toLowerCase())
  );

  // تمرير العنصر المحدد ليكون مرئياً
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
    return () => {};
  }, [selectedIndex]);

  if (!visible || filtered.length === 0) return null;

  const sections = {
    system: locale === 'ar' ? '⚡ الشخصيات الأساسية' : '⚡ System Personas',
    premium: locale === 'ar' ? '✨ الشخصيات المميزة' : '✨ Premium Personas',
    custom: locale === 'ar' ? '🎨 شخصياتي' : '🎨 My Personas',
    action: locale === 'ar' ? '⚙️ أوامر' : '⚙️ Commands',
  };

  let lastSection = '';
  let realIndex = 0;

  const handleSelect = (item: CommandItem) => {
    if (item.locked) return;
    if (item.id === '__none__') {
      clearPersona();
      onSelect('');
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div
      ref={listRef}
      className={cn(
        'absolute bottom-full start-0 end-0 mb-2 rounded-xl',
        'border border-gray-200 dark:border-dark-700',
        'bg-white dark:bg-dark-800 shadow-2xl overflow-hidden z-30',
        'max-h-[300px] overflow-y-auto custom-scrollbar animate-fade-in'
      )}
    >
      <div className="p-1.5">
        {filtered.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          const currentIndex = realIndex++;

          return (
            <div key={`${item.section}-${item.id}`}>
              {showSection && (
                <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {sections[item.section]}
                </p>
              )}
              <button
                data-index={currentIndex}
                onClick={() => handleSelect(item)}
                disabled={item.locked}
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-start transition-colors',
                  currentIndex === (selectedIndex % filtered.length)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : item.locked
                      ? 'text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
                  {item.id === '__none__' ? (
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-primary-500">{item.command}</code>
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{item.description}</p>
                </div>
                {item.locked && <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
