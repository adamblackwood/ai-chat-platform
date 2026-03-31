// إعدادات التدويل (i18n): تحديد اللغات المدعومة واللغة الافتراضية
// يُستخدم مع next-intl لتحميل ملفات الترجمة تلقائياً
import { getRequestConfig } from 'next-intl/server';

/**
 * اللغات المدعومة
 */
export const locales = ['ar', 'en'] as const;

/**
 * نوع اللغة
 */
export type Locale = (typeof locales)[number];

/**
 * اللغة الافتراضية
 */
export const defaultLocale: Locale = 'ar';

/**
 * بادئة اللغة في المسار
 */
export const localePrefix = 'always' as const;

/**
 * تحميل إعدادات اللغة حسب الطلب
 */
export default getRequestConfig(async ({ locale }) => {
  const validLocale: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  return {
    messages: (await import(`@/i18n/${validLocale}.json`)).default,
  };
});
