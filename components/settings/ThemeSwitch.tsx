// مبدل المظهر: تبديل فوري بين مظلم وفاتح وتلقائي مع انتقال سلس
'use client';

import { useTranslations } from 'next-intl';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/hooks/useTheme';

export function ThemeSwitch() {
  const tSettings = useTranslations('settings');
  const tSidebar = useTranslations('sidebar');
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      key: 'dark' as const,
      icon: Moon,
      label: tSidebar('theme_dark'),
      description: 'مظلم مريح للعين',
      preview: 'bg-dark-900 border-dark-700',
    },
    {
      key: 'light' as const,
      icon: Sun,
      label: tSidebar('theme_light'),
      description: 'فاتح ومشرق',
      preview: 'bg-white border-gray-200',
    },
    {
      key: 'auto' as const,
      icon: Monitor,
      label: tSidebar('theme_auto'),
      description: 'حسب نظام التشغيل',
      preview: 'bg-gradient-to-br from-dark-900 to-white border-gray-300',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-primary-500" />
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {tSettings('theme_tab')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themes.map(({ key, icon: Icon, label, preview }) => {
          const isActive = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                'relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-200',
                isActive
                  ? 'border-primary-500 bg-primary-500/10 shadow-md shadow-primary-500/10'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-800'
              )}
            >
              {isActive && (
                <div className="absolute top-2 end-2">
                  <Check className="h-4 w-4 text-primary-500" />
                </div>
              )}

              {/* معاينة المظهر */}
              <div className={cn('w-full h-12 rounded-lg border', preview)} />

              <Icon className={cn(
                'h-5 w-5',
                isActive ? 'text-primary-500' : 'text-gray-500'
              )} />

              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
