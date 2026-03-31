// مبدل اللغة: تبديل فوري بين العربية والإنجليزية مع حفظ التفضيل
'use client';

import { useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export function LanguageSwitch() {
  const tSettings = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const { setLocale } = useUIStore();
  const { user } = useAuthStore();

  const handleSwitch = useCallback(
    async (newLocale: 'ar' | 'en') => {
      if (newLocale === locale) return;

      setLocale(newLocale);

      // حفظ في قاعدة البيانات
      if (user) {
        supabase
          .from('profiles')
          .update({ preferred_language: newLocale })
          .eq('id', user.id)
          .then(() => {})
          .catch(() => {});
      }

      // تحديث المسار
      const segments = pathname.split('/');
      if (segments.length > 1 && (segments[1] === 'ar' || segments[1] === 'en')) {
        segments[1] = newLocale;
      }
      router.push(segments.join('/'));
    },
    [locale, setLocale, user, supabase, pathname, router]
  );

  const languages = [
    { code: 'ar' as const, label: 'العربية', flag: '🇸🇦', dir: 'RTL' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸', dir: 'LTR' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary-500" />
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {tSettings('language_tab')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSwitch(lang.code)}
              className={cn(
                'relative flex flex-col items-center gap-3 rounded-xl border p-6 transition-all duration-200',
                isActive
                  ? 'border-primary-500 bg-primary-500/10 shadow-md shadow-primary-500/10'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-800'
              )}
            >
              {isActive && (
                <div className="absolute top-2 end-2">
                  <Check className="h-5 w-5 text-primary-500" />
                </div>
              )}
              <span className="text-4xl">{lang.flag}</span>
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
              )}>
                {lang.label}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{lang.dir}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
