// الإعدادات السريعة: تبديل المظهر واللغة مع روابط الإعدادات وتسجيل الخروج
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Globe, Settings, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';

/**
 * مكون الإعدادات السريعة
 */
export function QuickSettings() {
  const t = useTranslations('sidebar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { theme, setTheme, setLocale } = useUIStore();
  const { signOut, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /**
   * تبديل المظهر
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * تبديل اللغة
   */
  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);

    // استبدال اللغة في المسار
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'ar' || segments[1] === 'en')) {
      segments[1] = newLocale;
    }
    router.push(segments.join('/'));
  };

  return (
    <>
      <div className="p-3 space-y-2">
        {/* معلومات المستخدم */}
        {user && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {user.display_name ?? user.email}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        )}

        <Separator />

        {/* أزرار الإعدادات السريعة */}
        <div className="flex items-center justify-between">
          {/* تبديل المظهر */}
          <Tooltip content={theme === 'dark' ? t('theme_light') : t('theme_dark')}>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
              aria-label={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </Tooltip>

          {/* تبديل اللغة */}
          <Tooltip content={locale === 'ar' ? t('language_en') : t('language_ar')}>
            <button
              onClick={toggleLocale}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
              aria-label={locale === 'ar' ? t('language_en') : t('language_ar')}
            >
              <Globe className="h-4 w-4" />
            </button>
          </Tooltip>

          {/* الإعدادات */}
          <Tooltip content={t('settings')}>
            <Link
              href="/settings"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
              aria-label={t('settings')}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </Tooltip>

          {/* تسجيل الخروج */}
          <Tooltip content={t('logout')}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label={t('logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* حوار تأكيد تسجيل الخروج */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title={t('logout')}
        message={useTranslations('auth')('logout_confirm')}
        confirmLabel={t('logout')}
        destructive
        onConfirm={signOut}
      />
    </>
  );
}
