// أنواع مفاتيح API: المفتاح، النموذج العام

/**
 * مفتاح API - يطابق جدول api_keys
 */
export interface ApiKey {
  id: string;
  user_id: string | null;
  platform: string;
  encrypted_key: string;
  label: string;
  is_global: boolean;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

/**
 * النموذج العام - يطابق جدول global_models
 */
export interface GlobalModel {
  id: string;
  api_key_id: string;
  model_id: string;
  model_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/**
 * بيانات إنشاء مفتاح API جديد
 */
export interface CreateApiKeyData {
  platform: string;
  key: string;
  label: string;
  is_global?: boolean;
}

/**
 * بيانات تحديث مفتاح API
 */
export interface UpdateApiKeyData {
  label?: string;
  is_active?: boolean;
}

/**
 * بيانات إنشاء نموذج عام
 */
export interface CreateGlobalModelData {
  api_key_id: string;
  model_id: string;
  model_name: string;
  sort_order?: number;
}

/**
 * مفتاح API مع النماذج المرتبطة
 */
export interface ApiKeyWithModels extends ApiKey {
  global_models?: GlobalModel[];
}

/**
 * مفتاح API مفكك التشفير (للاستخدام الداخلي فقط)
 */
export interface DecryptedApiKey {
  id: string;
  platform: string;
  decryptedKey: string;
  label: string;
  isGlobal: boolean;
}
