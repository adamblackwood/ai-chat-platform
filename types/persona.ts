// أنواع الشخصيات: أنواع الشخصية، الفئات، التقييمات

/**
 * أنواع الشخصيات في النظام
 */
export type PersonaType = 'system' | 'premium' | 'custom' | 'shared';

/**
 * فئات الشخصيات
 */
export type PersonaCategory = 'writing' | 'marketing' | 'programming' | 'education' | 'translation' | 'general';

/**
 * الشخصية - تطابق جدول personas
 */
export interface Persona {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  system_prompt: string;
  icon_url: string | null;
  category: PersonaCategory;
  type: PersonaType;
  is_active: boolean;
  is_approved: boolean;
  average_rating: number;
  rating_count: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * تقييم الشخصية - تطابق جدول persona_ratings
 */
export interface PersonaRating {
  id: string;
  persona_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

/**
 * بيانات إنشاء شخصية جديدة
 */
export interface CreatePersonaData {
  name: string;
  description: string;
  system_prompt: string;
  icon_url?: string;
  category: PersonaCategory;
  type: PersonaType;
}

/**
 * بيانات تحديث الشخصية
 */
export interface UpdatePersonaData {
  name?: string;
  description?: string;
  system_prompt?: string;
  icon_url?: string;
  category?: PersonaCategory;
  is_active?: boolean;
  is_approved?: boolean;
}

/**
 * تجربة الشخصية المميزة - تطابق جدول premium_persona_trials
 */
export interface PremiumPersonaTrial {
  id: string;
  user_id: string;
  persona_id: string;
  used_at: string;
}

/**
 * الشخصية مع معلومات إضافية للعرض
 */
export interface PersonaWithMeta extends Persona {
  userRating?: number;
  hasTrialUsed?: boolean;
  isLocked?: boolean;
}
