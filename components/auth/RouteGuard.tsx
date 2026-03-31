// حارس المسار: يحمي الصفحات ويتحقق من المصادقة والصلاحيات
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * خصائص حارس المسار
 */
interface RouteGuardProps {
  /** المحتوى المحمي */
  children: ReactNode;
  /** يتطلب دور مدير */
  requireAdmin?: boolean;
  /** يتطلب دور مميز أو أعلى */
  requirePremium?: boolean;
}

/**
 * مكون حارس المسار
 * يتحقق من المصادقة والصلاحيات قبل عرض المحتوى
 */
export function RouteGuard({
  children,
  requireAdmin = false,
  requirePremium = false,
}: RouteGuardProps) {
  const { user, isLoading, isBanned, isAdmin, isPremium, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (isLoading) return;

    // المستخدم غير مسجل
    if (!user) {
      const loginPath = `/${locale}/login`;
      const redirect = pathname !== loginPath ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`${loginPath}${redirect}`);
      return;
    }

    // المستخدم محظور
    if (isBanned) {
      router.replace(`/${locale}/login`);
      return;
    }

    // يتطلب صلاحية مدير
    if (requireAdmin && !isAdmin) {
      router.replace(`/${locale}/chat`);
      return;
    }

    // يتطلب صلاحية مميزة
    if (requirePremium && role === 'free') {
      router.replace(`/${locale}/chat`);
      return;
    }
  }, [user, isLoading, isBanned, isAdmin, isPremium, role, requireAdmin, requirePremium, router, pathname, locale]);

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-dark-950">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // المستخدم غير مسجل
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // المستخدم محظور
  if (isBanned) {
    return null;
  }

  // يتطلب مدير لكن المستخدم ليس مديراً
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // يتطلب مميز لكن المستخدم مجاني
  if (requirePremium && role === 'free') {
    return null;
  }

  return <>{children}</>;
}
