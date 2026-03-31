// مسار API للمصادقة: معالجة رد الاستدعاء من Supabase Auth
// يُستخدم لتبادل رمز المصادقة للحصول على جلسة
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClientFromRequest } from '@/lib/supabase-server';

/**
 * معالجة طلب GET لرد الاستدعاء
 * يتبادل رمز المصادقة مقابل جلسة
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') ?? '/ar/chat';

  if (code) {
    try {
      const supabase = createSupabaseServerClientFromRequest(request);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth callback error:', error.message);
        }
        return NextResponse.redirect(
          new URL('/ar/login?error=auth_callback_failed', requestUrl.origin)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL('/ar/login?error=auth_callback_error', requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
