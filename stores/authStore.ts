// مخزن المصادقة: يحفظ بيانات المستخدم والجلسة والدور
// لا يستخدم persist لأن بيانات المصادقة تأتي من Supabase عند كل تحميل
import { create } from 'zustand';
import type { Profile, Role } from '@/types/user';
import type { Session } from '@supabase/supabase-js';

/**
 * واجهة مخزن المصادقة
 */
interface AuthStore {
  /** الملف الشخصي للمستخدم الحالي */
  user: Profile | null;
  /** دور المستخدم الحالي */
  role: Role;
  /** جلسة Supabase */
  session: Session | null;
  /** هل المستخدم مدير خارق؟ */
  isSuperAdmin: boolean;
  /** هل استخدم المستخدم التجربة المجانية؟ */
  trialUsed: boolean;
  /** هل يتم تحميل بيانات المصادقة؟ */
  isLoading: boolean;
  /** هل المستخدم محظور؟ */
  isBanned: boolean;

  /** تعيين بيانات المستخدم */
  setUser: (user: Profile | null) => void;
  /** تعيين الدور */
  setRole: (role: Role) => void;
  /** تعيين الجلسة */
  setSession: (session: Session | null) => void;
  /** تعيين حالة المدير الخارق */
  setSuperAdmin: (isSuperAdmin: boolean) => void;
  /** تعيين حالة التجربة */
  setTrialUsed: (trialUsed: boolean) => void;
  /** تعيين حالة التحميل */
  setLoading: (isLoading: boolean) => void;
  /** تعيين حالة الحظر */
  setBanned: (isBanned: boolean) => void;
  /** مسح جميع بيانات المصادقة */
  clearAuth: () => void;
}

/**
 * مخزن المصادقة باستخدام Zustand
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: 'free',
  session: null,
  isSuperAdmin: false,
  trialUsed: false,
  isLoading: true,
  isBanned: false,

  setUser: (user) =>
    set({
      user,
      role: user?.role ?? 'free',
      isSuperAdmin: user?.is_super_admin ?? false,
      trialUsed: user?.trial_used ?? false,
      isBanned: user?.is_banned ?? false,
    }),

  setRole: (role) => set({ role }),

  setSession: (session) => set({ session }),

  setSuperAdmin: (isSuperAdmin) => set({ isSuperAdmin }),

  setTrialUsed: (trialUsed) => set({ trialUsed }),

  setLoading: (isLoading) => set({ isLoading }),

  setBanned: (isBanned) => set({ isBanned }),

  clearAuth: () =>
    set({
      user: null,
      role: 'free',
      session: null,
      isSuperAdmin: false,
      trialUsed: false,
      isLoading: false,
      isBanned: false,
    }),
}));
