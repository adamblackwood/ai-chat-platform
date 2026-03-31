// مخزن الإعدادات: يحفظ آخر منصة ونموذج مستخدمين مع persist
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlatformName } from '@/types/platform';

/**
 * واجهة مخزن الإعدادات
 */
interface SettingsStore {
  /** آخر منصة مستخدمة */
  lastUsedPlatform: PlatformName | null;
  /** آخر نموذج مستخدم */
  lastUsedModel: string | null;

  /** تعيين آخر منصة ونموذج مستخدمين */
  setLastUsed: (platform: PlatformName, model: string) => void;
}

/**
 * مخزن الإعدادات مع الحفظ المحلي
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      lastUsedPlatform: null,
      lastUsedModel: null,

      setLastUsed: (platform, model) =>
        set({
          lastUsedPlatform: platform,
          lastUsedModel: model,
        }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
