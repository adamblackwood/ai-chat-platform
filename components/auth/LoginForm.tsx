// نموذج تسجيل الدخول: حقل البريد وكلمة المرور مع التحقق والأخطاء
'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validators';
import { Link } from '@/i18n/navigation';

/**
 * مكون نموذج تسجيل الدخول
 */
export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get('redirect');

  /**
   * معالجة إرسال النموذج
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) {
        setError(t('error_generic'));
        return;
      }

      if (!isValidEmail(email)) {
        setError(t('error_invalid_credentials'));
        return;
      }

      if (!password) {
        setError(t('error_generic'));
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signIn(email, password);

        if (result.error) {
          setError(t(result.error));
          setIsSubmitting(false);
          return;
        }

        const target = redirectTo ?? `/${locale}/chat`;
        router.push(target);
        router.refresh();
      } catch {
        setError(t('error_network'));
        setIsSubmitting(false);
      }
    },
    [email, password, signIn, router, locale, redirectTo, t]
  );

  const isFormLoading = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* حقل البريد الإلكتروني */}
      <div className="space-y-2">
        <Label htmlFor="email" required>
          {t('email_label')}
        </Label>
        <div className="relative">
          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ps-10"
            autoComplete="email"
            autoFocus
            disabled={isFormLoading}
            dir="ltr"
          />
        </div>
      </div>

      {/* حقل كلمة المرور */}
      <div className="space-y-2">
        <Label htmlFor="password" required>
          {t('password_label')}
        </Label>
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ps-10 pe-10"
            autoComplete="current-password"
            disabled={isFormLoading}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}

      {/* زر تسجيل الدخول */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isFormLoading}
        disabled={isFormLoading || !email || !password}
      >
        {isFormLoading ? (
          t('logging_in')
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            {t('login_button')}
          </>
        )}
      </Button>

      {/* رابط إنشاء حساب */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {t('no_account')}{' '}
        <Link
          href="/register"
          className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          {t('register_button')}
        </Link>
      </p>
    </form>
  );
}
