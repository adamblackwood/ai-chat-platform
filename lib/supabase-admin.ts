// عميل Supabase الإداري: يتجاوز سياسات RLS بالكامل
// يُستخدم فقط في مسارات API على الخادم - لا يُعرَض للعميل أبداً
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * إنشاء أو إرجاع عميل Supabase الإداري
 * يستخدم Service Role Key لتجاوز RLS
 * تحذير: لا تستخدم هذا العميل في كود العميل أبداً!
 * @returns عميل Supabase الإداري
 */
export function createSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    );
  }

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

/**
 * الحصول على عميل Supabase الإداري (اختصار)
 */
export function getSupabaseAdminClient() {
  return createSupabaseAdminClient();
}
