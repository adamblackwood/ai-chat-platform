// دالة مساعدة لدمج أسماء أصناف Tailwind CSS بذكاء باستخدام clsx و tailwind-merge
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * دمج أسماء الأصناف مع حل التعارضات في Tailwind
 * @param inputs - قائمة بأسماء الأصناف أو الشروط
 * @returns سلسلة أصناف مدمجة ومحسنة
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
