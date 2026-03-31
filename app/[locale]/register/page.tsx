// صفحة إنشاء الحساب: نموذج التسجيل مع الشعار والتوجيه
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/common/Logo';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * صفحة إنشاء الحساب
 */
export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // إعادة التوجيه إذا كان المستخدم مسجلاً بالفعل
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(`/${locale}/chat`);
    }
  }, [user, isLoading, router, locale]);

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // المستخدم مسجل بالفعل
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -start-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-dark-700 bg-dark-900/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="items-center space-y-4 pb-2">
          <Logo size="lg" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-100">
              {t('register_title')}
            </h1>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
