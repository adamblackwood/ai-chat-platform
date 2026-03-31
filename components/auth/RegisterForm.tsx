// نموذج إنشاء الحساب: حقول البريد وكلمة المرور مع مؤشر القوة
'use client';

import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { cn } from '@/utils/cn';
import { Link } from '@/i18n/navigation';

/**
 * مكون نموذج إنشاء الحساب
 */
export function RegisterForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * التحقق من قوة كلمة المرور
   */
  const passwordValidation = useMemo(() => {
    if (!password) return null;
    return isValidPassword(password);
  }, [password]);

  /**
   * لون مؤشر القوة
   */
  const strengthColor = useMemo(() => {
    if (!passwordValidation) return 'bg-gray-200 dark:bg-dark-700';

    switch (passwordValidation.strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-200 dark:bg-dark-700';
    }
  }, [passwordValidation]);

  /**
   * نسبة مؤشر القوة
   */
  const strengthWidth = useMemo(() => {
    if (!passwordValidation) return '0%';

    switch (passwordValidation.strength) {
      case 'weak':
        return '33%';
      case 'medium':
        return '66%';
      case 'strong':
        return '100%';
      default:
        return '0%';
    }
  }, [passwordValidation]);

  /**
   * نص قوة كلمة المرور
   */
  const strengthText = useMemo(() => {
    if (!passwordValidation) return '';

    switch (passwordValidation.strength) {
      case 'weak':
        return t('password_strength_weak');
      case 'medium':
        return t('password_strength_medium');
      case 'strong':
        return t('password_strength_strong');
      default:
        return '';
    }
  }, [passwordValidation, t]);

  /**
   * التحقق من تطابق كلمات المرور
   */
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  /**
   * معالجة إرسال النموذج
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      if (!isValidEmail(email)) {
        setError(t('error_invalid_credentials'));
        return;
      }

      if (!passwordValidation?.isValid) {
        setError(t('error_weak_password'));
        return;
      }

      if (password !== confirmPassword) {
        setError(t('passwords_not_match'));
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signUp(email, password, displayName || undefined);

        if (result.error) {
          setError(t(result.error));
          setIsSubmitting(false);
          return;
        }

        router.push(`/${locale}/chat`);
        router.refresh();
      } catch {
        setError(t('error_network'));
        setIsSubmitting(false);
      }
    },
    [email, password, confirmPassword, displayName, passwordValidation, signUp, router, locale, t]
  );

  const isFormLoading = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* حقل الاسم المعروض */}
      <div className="space-y-2">
        <Label htmlFor="displayName">{t('display_name_label')}</Label>
        <div className="relative">
          <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="displayName"
            type="text"
            placeholder={t('display_name_placeholder')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="ps-10"
            autoComplete="name"
            disabled={isFormLoading}
          />
        </div>
      </div>

      {/* حقل البريد الإلكتروني */}
      <div className="space-y-2">
        <Label htmlFor="register-email" required>
          {t('email_label')}
        </Label>
        <div className="relative">
          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="register-email"
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
        <Label htmlFor="register-password" required>
          {t('password_label')}
        </Label>
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ps-10 pe-10"
            autoComplete="new-password"
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
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* مؤشر قوة كلمة المرور */}
        {password && (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', strengthColor)}
                style={{ width: strengthWidth }}
              />
            </div>
            <p
              className={cn('text-xs', {
                'text-red-500': passwordValidation?.strength === 'weak',
                'text-yellow-500': passwordValidation?.strength === 'medium',
                'text-green-500': passwordValidation?.strength === 'strong',
              })}
            >
              {strengthText}
            </p>
          </div>
        )}
      </div>

      {/* حقل تأكيد كلمة المرور */}
      <div className="space-y-2">
        <Label htmlFor="confirm-password" required>
          {t('confirm_password_label')}
        </Label>
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('confirm_password_placeholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn('ps-10 pe-10', !passwordsMatch && confirmPassword && 'border-red-500')}
            autoComplete="new-password"
            disabled={isFormLoading}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {!passwordsMatch && confirmPassword && (
          <p className="text-xs text-red-500">{t('passwords_not_match')}</p>
        )}
      </div>

      {/* رسالة الخطأ */}
      {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}

      {/* زر إنشاء الحساب */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isFormLoading}
        disabled={
          isFormLoading ||
          !email ||
          !password ||
          !confirmPassword ||
          !passwordsMatch ||
          !passwordValidation?.isValid
        }
      >
        {isFormLoading ? (
          t('registering')
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            {t('register_button')}
          </>
        )}
      </Button>

      {/* رابط تسجيل الدخول */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {t('have_account')}{' '}
        <Link
          href="/login"
          className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          {t('login_button')}
        </Link>
      </p>
    </form>
  );
}
