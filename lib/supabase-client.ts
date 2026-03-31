// عميل Supabase للمتصفح: يُستخدم في المكونات على جانب العميل فقط
// نمط Singleton لضمان إنشاء عميل واحد فقط طوال دورة حياة التطبيق
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * إنشاء أو إرجاع عميل Supabase للمتصفح
 * يستخدم نمط Singleton لتجنب إنشاء عملاء متعددين
 * @returns عميل Supabase للمتصفح
 */
export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    );
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  return browserClient;
}

/**
 * الحصول على عميل Supabase للمتصفح (اختصار)
 */
export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient();
}
