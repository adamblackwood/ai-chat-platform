// الوسيط الرئيسي: حماية المسارات، التحقق من الجلسة، توجيه اللغة، حماية لوحة الإدارة
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localeDetection: true,
  localePrefix: 'always',
});

const PUBLIC_PATHS = ['/login', '/register', '/invite'];
const PROTECTED_PATHS = ['/chat', '/personas', '/settings', '/admin'];
const ADMIN_PATHS = ['/admin'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.includes(path));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.includes(path));
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((path) => pathname.includes(path));
}

function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && (segments[1] === 'ar' || segments[1] === 'en')) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && (segments[1] === 'ar' || segments[1] === 'en')) {
    return segments[1];
  }
  return 'ar';
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  let response = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && isProtectedPath(pathWithoutLocale)) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session && isPublicPath(pathWithoutLocale)) {
      const chatUrl = new URL(`/${locale}/chat`, request.url);
      return NextResponse.redirect(chatUrl);
    }

    if (session && isAdminPath(pathWithoutLocale)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        const chatUrl = new URL(`/${locale}/chat`, request.url);
        return NextResponse.redirect(chatUrl);
      }

      if (profile.is_banned) {
        await supabase.auth.signOut();
        const loginUrl = new URL(`/${locale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (session && isProtectedPath(pathWithoutLocale) && !isAdminPath(pathWithoutLocale)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_banned) {
        await supabase.auth.signOut();
        const loginUrl = new URL(`/${locale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  } catch (error) {
    if (isProtectedPath(pathWithoutLocale)) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|icons|persona-icons|robots.txt|manifest.json).*)'],
};
