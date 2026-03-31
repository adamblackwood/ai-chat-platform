// أنواع أكواد الدعوة: الكود، سجل الاستخدام

/**
 * كود الدعوة - يطابق جدول invite_codes
 */
export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  max_uses: number;
  current_uses: number;
  premium_duration_days: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

/**
 * سجل استخدام كود الدعوة - يطابق جدول invite_code_uses
 */
export interface InviteCodeUse {
  id: string;
  invite_code_id: string;
  user_id: string;
  used_at: string;
}

/**
 * بيانات إنشاء كود دعوة جديد
 */
export interface CreateInviteCodeData {
  code?: string;
  max_uses?: number;
  premium_duration_days?: number;
  expires_at?: string;
}

/**
 * بيانات تحديث كود الدعوة
 */
export interface UpdateInviteCodeData {
  is_active?: boolean;
  max_uses?: number;
  expires_at?: string | null;
}

/**
 * كود الدعوة مع معلومات المنشئ
 */
export interface InviteCodeWithCreator extends InviteCode {
  creator_email?: string;
  creator_name?: string;
}

/**
 * سجل استخدام مع معلومات المستخدم
 */
export interface InviteCodeUseWithUser extends InviteCodeUse {
  user_email?: string;
  user_name?: string;
}
