// خطاف المظهر: يدير تبديل المظهر بين مظلم وفاتح وتلقائي
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ThemeMode = 'dark' | 'light' | 'auto';

interface UseThemeReturn {
  theme: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuthStore();
  const { theme, setTheme: setStoreTheme } = useUIStore();
  const initializedRef = useRef(false);

  /**
   * تطبيق المظهر على HTML
   */
  const applyTheme = useCallback((mode: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.transition = 'background-color 200ms ease, color 200ms ease';

    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.remove('dark');
    } else {
      // تلقائي - حسب النظام
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  /**
   * تعيين المظهر
   */
  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setStoreTheme(mode);
      applyTheme(mode);

      // حفظ في قاعدة البيانات
      if (user) {
        supabase
          .from('profiles')
          .update({ preferred_theme: mode })
          .eq('id', user.id)
          .then(() => {})
          .catch(() => {});
      }
    },
    [setStoreTheme, applyTheme, user, supabase]
  );

  /**
   * تبديل المظهر
   */
  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  /**
   * تطبيق المظهر عند التحميل
   */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    applyTheme(theme);

    // الاستماع لتغيير نظام الألوان في الوضع التلقائي
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    return () => {};
  }, [theme, applyTheme]);

  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return {
    theme,
    isDark,
    isLight: !isDark,
    setTheme,
    toggleTheme,
  };
}
