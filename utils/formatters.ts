// دوال التنسيق: التاريخ، الوقت النسبي، الأرقام، الرموز، المدة الزمنية

/**
 * تنسيق التاريخ حسب اللغة
 * @param date - التاريخ المراد تنسيقه
 * @param locale - اللغة (ar أو en)
 * @returns تاريخ منسق
 */
export function formatDate(date: Date | string, locale: string = 'ar'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
  }

  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';

  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * تنسيق الوقت النسبي (منذ X دقيقة/ساعة/يوم)
 * @param date - التاريخ المراد حساب الفرق منه
 * @param locale - اللغة (ar أو en)
 * @returns وقت نسبي منسق
 */
export function formatRelativeTime(date: Date | string, locale: string = 'ar'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (locale === 'ar') {
    if (diffSecs < 60) return 'الآن';
    if (diffMins < 2) return 'منذ دقيقة';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 2) return 'منذ ساعة';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 2) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffWeeks < 2) return 'منذ أسبوع';
    if (diffWeeks < 4) return `منذ ${diffWeeks} أسابيع`;
    if (diffMonths < 2) return 'منذ شهر';
    return `منذ ${diffMonths} أشهر`;
  }

  if (diffSecs < 60) return 'just now';
  if (diffMins < 2) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 2) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 2) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 2) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths < 2) return '1 month ago';
  return `${diffMonths} months ago`;
}

/**
 * تنسيق الأرقام حسب اللغة (مع الفواصل)
 * @param num - الرقم المراد تنسيقه
 * @param locale - اللغة (ar أو en)
 * @returns رقم منسق
 */
export function formatNumber(num: number, locale: string = 'ar'): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeCode).format(num);
}

/**
 * تنسيق عدد الرموز (tokens) بشكل مختصر
 * @param tokens - عدد الرموز
 * @returns عدد رموز منسق (مثل 1.2K أو 3.5M)
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(1)}M`;
}

/**
 * تنسيق المدة الزمنية بالثواني إلى نص مقروء
 * @param seconds - عدد الثواني
 * @returns مدة زمنية منسقة (مم:ثث)
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');

  return `${minsStr}:${secsStr}`;
}

/**
 * تنسيق حجم الملف
 * @param bytes - الحجم بالبايت
 * @returns حجم منسق (مثل 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i] ?? 'TB'}`;
}

/**
 * تنسيق وقت الاستجابة بالمللي ثانية
 * @param ms - الوقت بالمللي ثانية
 * @returns وقت منسق (مثل 1.2s أو 150ms)
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
