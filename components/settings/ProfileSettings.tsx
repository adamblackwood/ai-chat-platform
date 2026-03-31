// إعدادات الملف الشخصي: تعديل الاسم والإحصائيات والتجربة وكود الدعوة
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  User, Save, Gift, Sparkles, MessageSquare, Hash,
  Calendar, Crown, Ticket, Check, AlertCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { formatDate, formatNumber, formatTokenCount } from '@/utils/formatters';
import { isValidInviteCode } from '@/utils/validators';
import { TRIAL_DURATION_DAYS } from '@/utils/constants';

export function ProfileSettings() {
  const t = useTranslations('settings');
  const { user, refreshProfile } = useAuth();
  const { role } = useAuthStore();
  const supabase = createSupabaseBrowserClient();

  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [isActivatingTrial, setIsActivatingTrial] = useState(false);
  const [trialResult, setTrialResult] = useState<'success' | 'already_used' | null>(null);

  const [inviteCode, setInviteCode] = useState('');
  const [isActivatingCode, setIsActivatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);

  const [stats, setStats] = useState<{
    conversations: number;
    messages: number;
    tokens: number;
  } | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  /**
   * تحميل الإحصائيات
   */
  const loadStats = useCallback(async () => {
    if (!user || statsLoaded) return;
    setStatsLoaded(true);

    try {
      const [convResult, msgResult] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, total_tokens', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in(
            'conversation_id',
            ((await supabase.from('conversations').select('id').eq('user_id', user.id)).data ?? []).map(
              (c: { id: string }) => c.id
            )
          ),
      ]);

      const totalTokens = (convResult.data ?? []).reduce(
        (sum, c) => sum + ((c as { total_tokens: number }).total_tokens ?? 0),
        0
      );

      setStats({
        conversations: convResult.count ?? 0,
        messages: msgResult.count ?? 0,
        tokens: totalTokens,
      });
    } catch {
      // تجاهل
    }
  }, [user, supabase, statsLoaded]);

  // تحميل الإحصائيات عند العرض
  if (!statsLoaded && user) {
    loadStats();
  }

  /**
   * حفظ الاسم
   */
  const handleSaveName = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('id', user.id);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* تجاهل */ } finally {
      setIsSaving(false);
    }
  }, [user, displayName, supabase, refreshProfile]);

  /**
   * تفعيل التجربة المجانية
   */
  const handleActivateTrial = useCallback(async () => {
    if (!user || user.trial_used) {
      setTrialResult('already_used');
      return;
    }
    setIsActivatingTrial(true);
    try {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

      await supabase
        .from('profiles')
        .update({
          role: 'premium',
          trial_expires_at: trialEnd.toISOString(),
          premium_expires_at: trialEnd.toISOString(),
        })
        .eq('id', user.id);

      // إنشاء إشعار
      await supabase.from('notifications').insert({
        type: 'trial_requested',
        title: 'طلب تجربة مجانية',
        message: `المستخدم ${user.email} فعّل التجربة المجانية`,
        priority: 'info',
        related_user_id: user.id,
      });

      await refreshProfile();
      setTrialResult('success');
    } catch { /* تجاهل */ } finally {
      setIsActivatingTrial(false);
    }
  }, [user, supabase, refreshProfile]);

  /**
   * تفعيل كود الدعوة
   */
  const handleActivateCode = useCallback(async () => {
    if (!user) return;
    setCodeError('');
    setCodeSuccess(false);

    if (!isValidInviteCode(inviteCode)) {
      setCodeError(t('code_invalid'));
      return;
    }

    setIsActivatingCode(true);
    try {
      const response = await fetch(
        `/api/admin/invite-codes?code=${encodeURIComponent(inviteCode.trim())}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as Record<string, string>;
        setCodeError(data.error ?? t('code_invalid'));
        return;
      }

      // التفعيل عبر صفحة الدعوة
      const locale = document.documentElement.lang || 'ar';
      window.location.href = `/${locale}/invite/${inviteCode.trim()}`;
    } catch {
      setCodeError(t('code_invalid'));
    } finally {
      setIsActivatingCode(false);
    }
  }, [user, inviteCode, t]);

  if (!user) return null;

  const roleBadges = {
    admin: { label: t('admin') ?? 'Admin', variant: 'destructive' as const, icon: Crown },
    premium: { label: t('premium') ?? 'Premium', variant: 'premium' as const, icon: Sparkles },
    free: { label: t('free') ?? 'Free', variant: 'secondary' as const, icon: User },
  };
  const badge = roleBadges[role];

  return (
    <div className="space-y-6">
      {/* الاسم */}
      <div className="space-y-2">
        <Label>{t('display_name')}</Label>
        <div className="flex gap-2">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('display_name_placeholder')}
          />
          <Button onClick={handleSaveName} isLoading={isSaving} disabled={isSaving} size="icon">
            {saved ? <Check className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* البريد */}
      <div className="space-y-2">
        <Label>{t('email')}</Label>
        <Input value={user.email} disabled dir="ltr" />
      </div>

      {/* نوع الحساب وتاريخ الانضمام */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('account_type')}</Label>
          <div className="flex items-center gap-2">
            <badge.icon className="h-4 w-4 text-primary-500" />
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('join_date')}</Label>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 text-center">
            <MessageSquare className="h-5 w-5 text-primary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(stats.conversations)}
            </p>
            <p className="text-[10px] text-gray-500">{t('total_conversations')}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 text-center">
            <MessageSquare className="h-5 w-5 text-secondary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(stats.messages)}
            </p>
            <p className="text-[10px] text-gray-500">{t('total_messages')}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 text-center">
            <Hash className="h-5 w-5 text-accent-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatTokenCount(stats.tokens)}
            </p>
            <p className="text-[10px] text-gray-500">{t('total_tokens')}</p>
          </div>
        </div>
      )}

      {/* التجربة المجانية */}
      {role === 'free' && !user.trial_used && (
        <div className="rounded-xl border border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {t('trial_button')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {TRIAL_DURATION_DAYS} {useTranslations('common')('days')}
          </p>
          <Button
            onClick={handleActivateTrial}
            isLoading={isActivatingTrial}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t('trial_button')}
          </Button>
          {trialResult === 'success' && (
            <p className="text-sm text-green-500 flex items-center gap-1">
              <Check className="h-4 w-4" /> {t('trial_success')}
            </p>
          )}
        </div>
      )}

      {user.trial_used && role === 'free' && (
        <p className="text-sm text-gray-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {t('trial_already_used')}
        </p>
      )}

      {user.trial_expires_at && role === 'premium' && (
        <div className="flex items-center gap-2 text-sm text-primary-500">
          <Sparkles className="h-4 w-4" />
          <span>{t('trial_active')} - {t('trial_expires', { date: formatDate(user.trial_expires_at) })}</span>
        </div>
      )}

      {/* كود الدعوة */}
      {role === 'free' && (
        <div className="space-y-2">
          <Label>{t('invite_code_label')}</Label>
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t('invite_code_placeholder')}
              dir="ltr"
            />
            <Button
              onClick={handleActivateCode}
              isLoading={isActivatingCode}
              disabled={!inviteCode.trim() || isActivatingCode}
            >
              <Ticket className="h-4 w-4 me-1.5" />
              {t('activate_code')}
            </Button>
          </div>
          {codeError && <ErrorMessage message={codeError} dismissible onDismiss={() => setCodeError('')} />}
          {codeSuccess && (
            <p className="text-sm text-green-500 flex items-center gap-1">
              <Check className="h-4 w-4" /> {t('code_success')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
