// مخزن المنصة: يحفظ المنصة والنموذج النشطين ونوع المفتاح مع persist
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlatformName, Model } from '@/types/platform';

/**
 * نوع المفتاح (عام أو خاص)
 */
type ApiType = 'global' | 'private';

/**
 * واجهة مخزن المنصة
 */
interface PlatformStore {
  /** المنصة النشطة حالياً */
  activePlatform: PlatformName;
  /** النموذج النشط حالياً */
  activeModel: string;
  /** نوع المفتاح المستخدم */
  apiType: ApiType;
  /** النماذج المتاحة للمنصة الحالية */
  availableModels: Model[];

  /** تعيين المنصة النشطة */
  setPlatform: (platform: PlatformName) => void;
  /** تعيين النموذج النشط */
  setModel: (model: string) => void;
  /** تعيين نوع المفتاح */
  setApiType: (apiType: ApiType) => void;
  /** تعيين النماذج المتاحة */
  setAvailableModels: (models: Model[]) => void;
}

/**
 * مخزن المنصة مع الحفظ المحلي
 */
export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set) => ({
      activePlatform: 'openrouter',
      activeModel: '',
      apiType: 'global',
      availableModels: [],

      setPlatform: (platform) =>
        set({
          activePlatform: platform,
          activeModel: '',
          availableModels: [],
        }),

      setModel: (model) => set({ activeModel: model }),

      setApiType: (apiType) => set({ apiType }),

      setAvailableModels: (models) => set({ availableModels: models }),
    }),
    {
      name: 'platform-store',
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
      partialize: (state) => ({
        activePlatform: state.activePlatform,
        activeModel: state.activeModel,
        apiType: state.apiType,
      }),
    }
  )
);
