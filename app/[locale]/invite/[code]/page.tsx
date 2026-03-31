// صفحة كود الدعوة: عرض الكود وتفعيله للحصول على الحساب المميز
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Gift, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/common/Logo';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/hooks/useAuth';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { isValidInviteCode } from '@/utils/validators';

/**
 * خصائص صفحة كود الدعوة
 */
interface InviteCodePageProps {
  params: { code: string; locale: string };
}

/**
 * معلومات كود الدعوة
 */
interface InviteCodeInfo {
  id: string;
  code: string;
  maxUses: number;
  currentUses: number;
  premiumDurationDays: number | null;
  isActive: boolean;
  expiresAt: string | null;
}

/**
 * صفحة كود الدعوة
 */
export default function InviteCodePage({ params }: InviteCodePageProps) {
  return (
    <RouteGuard>
      <InviteCodeContent code={params.code} />
    </RouteGuard>
  );
}

/**
 * محتوى صفحة كود الدعوة
 */
function InviteCodeContent({ code }: { code: string }) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { user, refreshProfile, role } = useAuth();
  const supabase = createSupabaseBrowserClient();

  const [codeInfo, setCodeInfo] = useState<InviteCodeInfo | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * جلب معلومات الكود
   */
  const fetchCodeInfo = useCallback(async () => {
    setIsLoadingCode(true);
    setError('');

    try {
      if (!isValidInviteCode(code)) {
        setError(t('code_invalid'));
        setIsLoadingCode(false);
        return;
      }

      const response = await fetch(`/api/admin/invite-codes?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as Record<string, string>;
        setError(data.error ?? t('code_invalid'));
        setIsLoadingCode(false);
        return;
      }

      const data = await response.json() as InviteCodeInfo;
      setCodeInfo(data);
    } catch {
      setError(t('code_invalid'));
    } finally {
      setIsLoadingCode(false);
    }
  }, [code, t]);

  useEffect(() => {
    fetchCodeInfo();

    return () => {
      // cleanup
    };
  }, [fetchCodeInfo]);

  /**
   * تفعيل الكود
   */
  const activateCode = useCallback(async () => {
    if (!user || !codeInfo) return;

    setIsActivating(true);
    setError('');

    try {
      // التحقق من أن الكود لا يزال نشطاً
      if (!codeInfo.isActive) {
        setError(t('code_invalid'));
        setIsActivating(false);
        return;
      }

      // التحقق من انتهاء الصلاحية
      if (codeInfo.expiresAt && new Date(codeInfo.expiresAt) < new Date()) {
        setError(t('code_expired'));
        setIsActivating(false);
        return;
      }

      // التحقق من الحد الأقصى للاستخدام
      if (codeInfo.currentUses >= codeInfo.maxUses) {
        setError(t('code_used'));
        setIsActivating(false);
        return;
      }

      // التحقق من الاستخدام السابق
      const { data: existingUse } = await supabase
        .from('invite_code_uses')
        .select('id')
        .eq('invite_code_id', codeInfo.id)
        .eq('user_id', user.id)
        .single();

      if (existingUse) {
        setError(t('code_already_used'));
        setIsActivating(false);
        return;
      }

      // حساب تاريخ انتهاء الاشتراك المميز
      let premiumExpiresAt: string | null = null;
      if (codeInfo.premiumDurationDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + codeInfo.premiumDurationDays);
        premiumExpiresAt = expiryDate.toISOString();
      }

      // تحديث الملف الشخصي
      const updateData: Record<string, unknown> = {
        role: 'premium' as const,
        updated_at: new Date().toISOString(),
      };

      if (premiumExpiresAt) {
        updateData.premium_expires_at = premiumExpiresAt;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) {
        setError(t('code_invalid'));
        setIsActivating(false);
        return;
      }

      // تسجيل استخدام الكود
      const { error: useError } = await supabase
        .from('invite_code_uses')
        .insert({
          invite_code_id: codeInfo.id,
          user_id: user.id,
        });

      if (useError) {
        // الاستخدام مسجل بالفعل أو خطأ آخر - لكن الملف الشخصي تم تحديثه
        if (process.env.NODE_ENV === 'development') {
          console.error('Error recording invite code use:', useError.message);
        }
      }

      // تحديث عداد الاستخدام
      await supabase
        .from('invite_codes')
        .update({ current_uses: codeInfo.currentUses + 1 })
        .eq('id', codeInfo.id);

      // إنشاء إشعار
      await supabase.from('notifications').insert({
        type: 'invite_code_used',
        title: 'استخدام كود دعوة',
        message: `تم استخدام كود الدعوة ${codeInfo.code} بواسطة ${user.email}`,
        priority: 'info',
        related_user_id: user.id,
        metadata: {
          code: codeInfo.code,
          user_email: user.email,
          premium_duration_days: codeInfo.premiumDurationDays,
        },
      });

      setSuccess(true);
      await refreshProfile();

      // الانتقال لصفحة الدردشة بعد ثانيتين
      setTimeout(() => {
        router.push(`/${locale}/chat`);
      }, 2000);
    } catch {
      setError(t('code_invalid'));
    } finally {
      setIsActivating(false);
    }
  }, [user, codeInfo, supabase, refreshProfile, router, locale, t]);

  // المستخدم بالفعل مميز
  if (role === 'premium' || role === 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
        <Card className="w-full max-w-md border-dark-700 bg-dark-900/95 backdrop-blur-xl">
          <CardHeader className="items-center text-center">
            <Sparkles className="h-12 w-12 text-primary-500 mb-2" />
            <CardTitle className="text-gray-100">
              {role === 'admin' ? tCommon('admin') : tCommon('premium')}
            </CardTitle>
            <CardDescription>
              {role === 'admin'
                ? 'أنت مدير بالفعل ولديك جميع الصلاحيات'
                : 'لديك حساب مميز بالفعل'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(`/${locale}/chat`)}>
              {tCommon('back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // حالة التحميل
  if (isLoadingCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <LoadingSpinner size="lg" text={tCommon('loading')} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -start-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-dark-700 bg-dark-900/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="items-center text-center space-y-4">
          <Logo size="lg" />

          {success ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle className="text-green-400">
                {t('code_success')}
              </CardTitle>
              <CardDescription>
                {codeInfo?.premiumDurationDays
                  ? `مدة الاشتراك: ${codeInfo.premiumDurationDays} يوم`
                  : tCommon('permanent')}
              </CardDescription>
            </>
          ) : error && !codeInfo ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <CardTitle className="text-red-400">{error}</CardTitle>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
                <Gift className="h-10 w-10 text-primary-500" />
              </div>
              <CardTitle className="text-gray-100">{t('invite_code_label')}</CardTitle>
              <CardDescription>
                {codeInfo?.premiumDurationDays
                  ? `الترقية للحساب المميز لمدة ${codeInfo.premiumDurationDays} يوم`
                  : 'الترقية للحساب المميز بشكل دائم'}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* عرض الكود */}
          {codeInfo && !success && (
            <>
              <div className="flex items-center justify-center rounded-lg bg-dark-800 border border-dark-600 p-4">
                <code className="text-xl font-mono font-bold text-primary-400 tracking-wider">
                  {code}
                </code>
              </div>

              {/* معلومات الكود */}
              <div className="space-y-2 text-sm text-gray-400">
                {codeInfo.premiumDurationDays && (
                  <div className="flex items-center justify-between">
                    <span>مدة الاشتراك:</span>
                    <span className="text-primary-400 font-medium">
                      {codeInfo.premiumDurationDays} يوم
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>الاستخدامات:</span>
                  <span className="text-gray-300">
                    {codeInfo.currentUses} / {codeInfo.maxUses}
                  </span>
                </div>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <ErrorMessage
                  message={error}
                  dismissible
                  onDismiss={() => setError('')}
                />
              )}

              {/* زر التفعيل */}
              <Button
                onClick={activateCode}
                className="w-full"
                size="lg"
                isLoading={isActivating}
                disabled={isActivating}
              >
                {isActivating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري التفعيل...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t('activate_code')}
                  </>
                )}
              </Button>
            </>
          )}

          {/* حالة عدم وجود الكود أو خطأ */}
          {!codeInfo && error && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/chat`)}
              >
                {tCommon('back')}
              </Button>
            </div>
          )}

          {/* بعد النجاح */}
          {success && (
            <div className="flex justify-center">
              <Button onClick={() => router.push(`/${locale}/chat`)}>
                ابدأ الاستخدام
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
