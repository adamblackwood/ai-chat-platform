// دوال مساعدة عامة: توليد أكواد، اقتصاص نص، أحرف أولى، تأخير، اتجاه اللغة

/**
 * توليد كود عشوائي من أحرف وأرقام
 * @param length - طول الكود (افتراضي 8)
 * @returns كود عشوائي
 */
export function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    const index = array[i];
    if (index !== undefined) {
      result += chars[index % chars.length];
    }
  }

  return result;
}

/**
 * اقتصاص النص مع إضافة علامة الحذف
 * @param text - النص الأصلي
 * @param max - الحد الأقصى للأحرف (افتراضي 50)
 * @returns نص مقتصر
 */
export function truncateText(text: string, max: number = 50): string {
  if (!text || typeof text !== 'string') return '';

  if (text.length <= max) return text;

  return text.substring(0, max).trim() + '...';
}

/**
 * استخراج الأحرف الأولى من الاسم
 * @param name - الاسم الكامل
 * @returns حرف أو حرفين أوليين
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?';

  const trimmed = name.trim();
  if (trimmed.length === 0) return '?';

  const words = trimmed.split(/\s+/);

  if (words.length === 1) {
    const firstWord = words[0];
    return firstWord ? firstWord.substring(0, 2).toUpperCase() : '?';
  }

  const first = words[0];
  const last = words[words.length - 1];

  const firstChar = first ? first[0] : '';
  const lastChar = last ? last[0] : '';

  return (firstChar + lastChar).toUpperCase();
}

/**
 * تأخير تنفيذ الدالة (Debounce)
 * @param fn - الدالة المراد تأخيرها
 * @param delay - مدة التأخير بالمللي ثانية (افتراضي 300)
 * @returns دالة مؤجلة
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * تأخير بالمللي ثانية (Promise-based)
 * @param ms - المدة بالمللي ثانية
 * @returns Promise ينتهي بعد المدة المحددة
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * تحديد اتجاه النص بناءً على اللغة
 * @param locale - كود اللغة (ar أو en)
 * @returns اتجاه النص (rtl أو ltr)
 */
export function getDirectionFromLocale(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * التحقق مما إذا كان المتصفح يدعم خاصية معينة
 * @param feature - اسم الخاصية
 * @returns هل الخاصية مدعومة؟
 */
export function isFeatureSupported(feature: 'clipboard' | 'share' | 'notification'): boolean {
  if (typeof window === 'undefined') return false;

  switch (feature) {
    case 'clipboard':
      return Boolean(navigator.clipboard);
    case 'share':
      return Boolean(navigator.share);
    case 'notification':
      return 'Notification' in window;
    default:
      return false;
  }
}

/**
 * نسخ نص إلى الحافظة
 * @param text - النص المراد نسخه
 * @returns هل تمت العملية بنجاح؟
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  } catch {
    return false;
  }
}

/**
 * تحويل سلسلة UUID صالحة
 * @param id - النص المراد التحقق منه
 * @returns هل هو UUID صالح؟
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
