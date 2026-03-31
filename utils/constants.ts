// الثوابت العامة للتطبيق: حدود الاستخدام، المنصات المدعومة، أنواع الشخصيات والإشعارات

/**
 * حدود الاستخدام للحسابات المجانية والمميزة
 */
export const FREE_MESSAGES_BEFORE_DELAY = 4;
export const FREE_DELAY_SECONDS = 180;
export const PREMIUM_DELAY_SECONDS = 60;
export const MESSAGE_LIMIT_PER_CHAT = 15;
export const FREE_MAX_CONVERSATIONS = 20;
export const FREE_MAX_API_KEYS = 2;
export const FREE_MAX_PERSONAS = 4;
export const TRIAL_DURATION_DAYS = 3;

/**
 * معلومات المنصة الواحدة
 */
export interface PlatformInfo {
  readonly name: string;
  readonly displayName: string;
  readonly icon: string;
  readonly baseUrl: string;
  readonly authHeader: string;
  readonly isOpenAICompatible: boolean;
}

/**
 * المنصات المدعومة للذكاء الاصطناعي (7 منصات)
 */
export const SUPPORTED_PLATFORMS: readonly PlatformInfo[] = [
  {
    name: 'openrouter',
    displayName: 'OpenRouter',
    icon: '🌐',
    baseUrl: 'https://openrouter.ai/api/v1',
    authHeader: 'Authorization',
    isOpenAICompatible: true,
  },
  {
    name: 'groq',
    displayName: 'Groq',
    icon: '⚡',
    baseUrl: 'https://api.groq.com/openai/v1',
    authHeader: 'Authorization',
    isOpenAICompatible: true,
  },
  {
    name: 'openai',
    displayName: 'OpenAI',
    icon: '🤖',
    baseUrl: 'https://api.openai.com/v1',
    authHeader: 'Authorization',
    isOpenAICompatible: true,
  },
  {
    name: 'anthropic',
    displayName: 'Anthropic',
    icon: '🧠',
    baseUrl: 'https://api.anthropic.com/v1',
    authHeader: 'x-api-key',
    isOpenAICompatible: false,
  },
  {
    name: 'gemini',
    displayName: 'Google Gemini',
    icon: '💎',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    authHeader: 'x-goog-api-key',
    isOpenAICompatible: false,
  },
  {
    name: 'together',
    displayName: 'Together AI',
    icon: '🤝',
    baseUrl: 'https://api.together.xyz/v1',
    authHeader: 'Authorization',
    isOpenAICompatible: true,
  },
  {
    name: 'mistral',
    displayName: 'Mistral',
    icon: '🌊',
    baseUrl: 'https://api.mistral.ai/v1',
    authHeader: 'Authorization',
    isOpenAICompatible: true,
  },
] as const;

/**
 * فئات الشخصيات
 */
export const PERSONA_CATEGORIES = [
  'writing',
  'marketing',
  'programming',
  'education',
  'translation',
  'general',
] as const;

/**
 * تصنيفات فئات الشخصيات مع التسميات
 */
export interface PersonaCategoryInfo {
  readonly value: string;
  readonly labelAr: string;
  readonly labelEn: string;
  readonly icon: string;
}

export const PERSONA_CATEGORY_INFO: readonly PersonaCategoryInfo[] = [
  { value: 'writing', labelAr: 'كتابة', labelEn: 'Writing', icon: '✍️' },
  { value: 'marketing', labelAr: 'تسويق', labelEn: 'Marketing', icon: '📢' },
  { value: 'programming', labelAr: 'برمجة', labelEn: 'Programming', icon: '💻' },
  { value: 'education', labelAr: 'تعليم', labelEn: 'Education', icon: '📚' },
  { value: 'translation', labelAr: 'ترجمة', labelEn: 'Translation', icon: '🌍' },
  { value: 'general', labelAr: 'عام', labelEn: 'General', icon: '🎯' },
] as const;

/**
 * أنواع الإشعارات التسعة
 */
export const NOTIFICATION_TYPES = [
  'user_registered',
  'trial_requested',
  'trial_expired',
  'premium_expired',
  'persona_shared',
  'api_low_balance',
  'api_depleted',
  'system_error',
  'invite_code_used',
] as const;

/**
 * معلومات أنواع الإشعارات
 */
export interface NotificationTypeInfo {
  readonly type: string;
  readonly labelAr: string;
  readonly labelEn: string;
  readonly icon: string;
  readonly defaultPriority: 'urgent' | 'normal' | 'info';
}

export const NOTIFICATION_TYPE_INFO: readonly NotificationTypeInfo[] = [
  { type: 'user_registered', labelAr: 'مستخدم جديد', labelEn: 'New User', icon: '👤', defaultPriority: 'info' },
  { type: 'trial_requested', labelAr: 'طلب تجربة', labelEn: 'Trial Requested', icon: '🎁', defaultPriority: 'normal' },
  { type: 'trial_expired', labelAr: 'انتهاء تجربة', labelEn: 'Trial Expired', icon: '⏰', defaultPriority: 'normal' },
  { type: 'premium_expired', labelAr: 'انتهاء اشتراك', labelEn: 'Premium Expired', icon: '💫', defaultPriority: 'normal' },
  { type: 'persona_shared', labelAr: 'شخصية مشتركة', labelEn: 'Persona Shared', icon: '🔄', defaultPriority: 'info' },
  { type: 'api_low_balance', labelAr: 'رصيد منخفض', labelEn: 'Low API Balance', icon: '⚠️', defaultPriority: 'urgent' },
  { type: 'api_depleted', labelAr: 'نفاد الرصيد', labelEn: 'API Depleted', icon: '🚫', defaultPriority: 'urgent' },
  { type: 'system_error', labelAr: 'خطأ نظام', labelEn: 'System Error', icon: '❌', defaultPriority: 'urgent' },
  { type: 'invite_code_used', labelAr: 'استخدام كود', labelEn: 'Invite Code Used', icon: '🎟️', defaultPriority: 'info' },
] as const;

/**
 * الأوامر المائلة للشخصيات المدمجة
 */
export interface SlashCommand {
  readonly command: string;
  readonly personaId: string;
  readonly labelAr: string;
  readonly labelEn: string;
  readonly description_ar: string;
  readonly description_en: string;
}

export const SLASH_COMMANDS: readonly SlashCommand[] = [
  {
    command: '/linkedin',
    personaId: 'a0000000-0000-0000-0000-000000000001',
    labelAr: 'خبير لينكدإن',
    labelEn: 'LinkedIn Expert',
    description_ar: 'كتابة محتوى لينكدإن احترافي',
    description_en: 'Write professional LinkedIn content',
  },
  {
    command: '/brainstorm',
    personaId: 'a0000000-0000-0000-0000-000000000002',
    labelAr: 'خبير العصف الذهني',
    labelEn: 'Brainstorming Expert',
    description_ar: 'توليد أفكار إبداعية وحل مشكلات',
    description_en: 'Generate creative ideas and solve problems',
  },
  {
    command: '/prompt',
    personaId: 'a0000000-0000-0000-0000-000000000003',
    labelAr: 'خبير هندسة الأوامر',
    labelEn: 'Prompt Engineering Expert',
    description_ar: 'كتابة وتحسين أوامر الذكاء الاصطناعي',
    description_en: 'Write and improve AI prompts',
  },
  {
    command: '/email',
    personaId: 'a0000000-0000-0000-0000-000000000004',
    labelAr: 'خبير كتابة الإيميلات',
    labelEn: 'Email Writing Expert',
    description_ar: 'كتابة رسائل بريد إلكتروني احترافية',
    description_en: 'Write professional emails',
  },
] as const;

/**
 * ثوابت واجهة المستخدم
 */
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MAX_MESSAGE_LENGTH: 10000,
  MAX_PERSONA_NAME_LENGTH: 50,
  MAX_PERSONA_DESCRIPTION_LENGTH: 200,
  MAX_SYSTEM_PROMPT_LENGTH: 5000,
  MAX_CONVERSATION_TITLE_LENGTH: 100,
  MAX_FOLDER_NAME_LENGTH: 50,
  MAX_API_KEY_LABEL_LENGTH: 50,
  INVITE_CODE_LENGTH: 8,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
} as const;
