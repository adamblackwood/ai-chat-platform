// عميل Supabase للخادم: يُستخدم في مسارات API و Server Components
// يتعامل مع الكوكيز تلقائياً للحفاظ على جلسة المستخدم
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * إنشاء عميل Supabase للخادم مع إدارة الكوكيز
 * يُستخدم في Server Components ومسارات API
 * @returns عميل Supabase للخادم
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // يحدث عند استدعاء set في Server Component
          // يمكن تجاهله بأمان لأن الكوكيز ستُحدَّث في middleware
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // نفس السبب أعلاه
        }
      },
    },
  });
}

/**
 * إنشاء عميل Supabase للخادم مع إدارة الكوكيز من كائن Request
 * يُستخدم في مسارات API (Route Handlers)
 * @param request - كائن الطلب
 * @returns عميل Supabase للخادم مع كائن الاستجابة
 */
export function createSupabaseServerClientFromRequest(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables'
    );
  }

  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // تجاهل في حالة عدم إمكانية الكتابة
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // تجاهل في حالة عدم إمكانية الكتابة
        }
      },
    },
  });
}
