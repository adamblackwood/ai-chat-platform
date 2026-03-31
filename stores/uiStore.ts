// مخزن واجهة المستخدم: يحفظ إعدادات الواجهة مع persist في localStorage
// يتضمن الشريط الجانبي، المظهر، اللغة، جولة التعريف
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * نوع المظهر
 */
type Theme = 'dark' | 'light' | 'auto';

/**
 * نوع اللغة
 */
type Locale = 'ar' | 'en';

/**
 * واجهة مخزن واجهة المستخدم
 */
interface UIStore {
  /** هل الشريط الجانبي مفتوح؟ */
  sidebarOpen: boolean;
  /** هل الشريط الجانبي مطوي (أيقونات فقط)؟ */
  sidebarCollapsed: boolean;
  /** المظهر الحالي */
  theme: Theme;
  /** اللغة الحالية */
  locale: Locale;
  /** هل جولة التعريف نشطة؟ */
  tourActive: boolean;
  /** خطوة جولة التعريف الحالية */
  tourStep: number;

  /** تبديل حالة الشريط الجانبي */
  toggleSidebar: () => void;
  /** تعيين حالة الشريط الجانبي */
  setSidebarOpen: (open: boolean) => void;
  /** تبديل حالة طي الشريط الجانبي */
  collapseSidebar: () => void;
  /** تعيين المظهر */
  setTheme: (theme: Theme) => void;
  /** تعيين اللغة */
  setLocale: (locale: Locale) => void;
  /** تعيين حالة جولة التعريف */
  setTourActive: (active: boolean) => void;
  /** تعيين خطوة جولة التعريف */
  setTourStep: (step: number) => void;
}

/**
 * مخزن واجهة المستخدم مع الحفظ المحلي
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'dark',
      locale: 'ar',
      tourActive: false,
      tourStep: 0,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      collapseSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setTheme: (theme) => set({ theme }),

      setLocale: (locale) => set({ locale }),

      setTourActive: (active) => set({ tourActive: active }),

      setTourStep: (step) => set({ tourStep: step }),
    }),
    {
      name: 'ui-store',
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
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        locale: state.locale,
      }),
    }
  )
);
