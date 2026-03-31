// إعدادات التنقل مع next-intl: تصدير دوال التنقل المحلية
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

/**
 * اللغات المدعومة
 */
export const locales = ['ar', 'en'] as const;

/**
 * بادئة اللغة في المسار
 */
export const localePrefix = 'always' as const;

/**
 * دوال التنقل المحلية
 * Link: رابط مع دعم اللغة
 * redirect: إعادة توجيه مع دعم اللغة
 * usePathname: مسار الصفحة الحالية
 * useRouter: موجه مع دعم اللغة
 */
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
