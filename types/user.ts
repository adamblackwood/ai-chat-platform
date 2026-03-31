// أنواع المستخدم: الأدوار، الملف الشخصي، حالة المصادقة

/**
 * أدوار المستخدمين في النظام
 */
export type Role = 'admin' | 'premium' | 'free';

/**
 * الملف الشخصي للمستخدم - يطابق جدول profiles
 */
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: Role;
  is_super_admin: boolean;
  premium_expires_at: string | null;
  trial_used: boolean;
  trial_expires_at: string | null;
  is_banned: boolean;
  onboarding_completed: boolean;
  preferred_language: string;
  preferred_theme: string;
  created_at: string;
  updated_at: string;
}

/**
 * حالة المصادقة في التطبيق
 */
export interface AuthState {
  user: Profile | null;
  role: Role;
  isLoading: boolean;
  isBanned: boolean;
  isSuperAdmin: boolean;
  trialUsed: boolean;
}

/**
 * بيانات تحديث الملف الشخصي
 */
export interface ProfileUpdateData {
  display_name?: string;
  preferred_language?: string;
  preferred_theme?: string;
  onboarding_completed?: boolean;
}

/**
 * بيانات تحديث المستخدم من قبل المدير
 */
export interface AdminUserUpdateData {
  role?: Role;
  is_banned?: boolean;
  premium_expires_at?: string | null;
  trial_used?: boolean;
  trial_expires_at?: string | null;
}

/**
 * إحصائيات المستخدم
 */
export interface UserStats {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalPersonas: number;
  totalApiKeys: number;
}
