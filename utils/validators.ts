// دوال التحقق: البريد الإلكتروني، كلمة المرور، مفاتيح API، أكواد الدعوة

/**
 * نتيجة التحقق من كلمة المرور
 */
export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email - البريد الإلكتروني
 * @returns هل البريد صالح؟
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * التحقق من قوة كلمة المرور
 * @param password - كلمة المرور
 * @returns نتيجة التحقق مع مستوى القوة والأخطاء
 */
export function isValidPassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, strength: 'weak', errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('min_length');
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase && !hasLowercase) {
    errors.push('need_letter');
  }

  if (!hasNumber) {
    errors.push('need_number');
  }

  let strengthScore = 0;
  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (hasUppercase) strengthScore++;
  if (hasLowercase) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSpecial) strengthScore++;

  let strength: 'weak' | 'medium' | 'strong';
  if (strengthScore <= 2) {
    strength = 'weak';
  } else if (strengthScore <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: password.length >= 8 && errors.length === 0,
    strength,
    errors,
  };
}

/**
 * التحقق من صحة مفتاح API حسب المنصة
 * @param key - مفتاح API
 * @param platform - اسم المنصة
 * @returns هل المفتاح يتوافق مع تنسيق المنصة؟
 */
export function isValidApiKey(key: string, platform: string): boolean {
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    return false;
  }

  const trimmedKey = key.trim();

  switch (platform) {
    case 'openrouter':
      return trimmedKey.startsWith('sk-or-') && trimmedKey.length > 10;

    case 'groq':
      return trimmedKey.startsWith('gsk_') && trimmedKey.length > 10;

    case 'openai':
      return trimmedKey.startsWith('sk-') && trimmedKey.length > 10;

    case 'anthropic':
      return trimmedKey.startsWith('sk-ant-') && trimmedKey.length > 10;

    case 'gemini':
      return trimmedKey.startsWith('AI') && trimmedKey.length > 10;

    case 'together':
      return trimmedKey.length > 10;

    case 'mistral':
      return trimmedKey.length > 10;

    default:
      return trimmedKey.length > 5;
  }
}

/**
 * التحقق من صحة كود الدعوة
 * @param code - كود الدعوة
 * @returns هل الكود يحتوي على أحرف وأرقام فقط؟
 */
export function isValidInviteCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(code.trim()) && code.trim().length >= 4;
}

/**
 * التحقق من صحة اسم العرض
 * @param name - الاسم
 * @returns هل الاسم صالح؟
 */
export function isValidDisplayName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;

  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}

/**
 * التحقق من صحة نص النظام (System Prompt)
 * @param prompt - نص النظام
 * @returns هل النص صالح؟
 */
export function isValidSystemPrompt(prompt: string): boolean {
  if (!prompt || typeof prompt !== 'string') return false;

  const trimmed = prompt.trim();
  return trimmed.length >= 10 && trimmed.length <= 5000;
}

/**
 * تنقية النص من الأحرف الخطرة
 * @param input - النص المدخل
 * @returns نص منقى
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
