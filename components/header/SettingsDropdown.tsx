// قائمة الإعدادات المنسدلة: ملف شخصي ومفاتيح وتصدير وجولة ومدير وخروج
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Settings, User, Key, Download, HelpCircle, Hash,
  Shield, LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function SettingsDropdown() {
  const t = useTranslations('header');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { role, user } = useAuthStore();
  const { setTourActive } = useUIStore();
  const { signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAdmin = role === 'admin';

  const roleBadge = {
    admin: { label: t('account_admin'), variant: 'destructive' as const },
    premium: { label: t('account_premium'), variant: 'premium' as const },
    free: { label: t('account_free'), variant: 'secondary' as const },
  };

  const currentBadge = roleBadge[role];

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger onClick={() => setOpen(!open)}>
          <button
            className={cn(
              'rounded-lg p-2 text-gray-500 transition-colors',
              'hover:bg-gray-100 dark:hover:bg-dark-800'
            )}
            aria-label={t('settings_profile')}
          >
            <Settings className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {/* معلومات المستخدم */}
            <div className="px-3 py-2 space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {user?.display_name ?? user?.email ?? ''}
              </p>
              <Badge variant={currentBadge.variant} className="text-[10px]">
                {currentBadge.label}
              </Badge>
            </div>

            <DropdownMenuSeparator />

            {/* الملف الشخصي */}
            <DropdownMenuItem
              icon={<User className="h-4 w-4" />}
              onClick={() => { router.push(`/${locale}/settings`); setOpen(false); }}
            >
              {t('settings_profile')}
            </DropdownMenuItem>

            {/* مفاتيح API */}
            <DropdownMenuItem
              icon={<Key className="h-4 w-4" />}
              onClick={() => { router.push(`/${locale}/settings`); setOpen(false); }}
            >
              {t('settings_api_keys')}
            </DropdownMenuItem>

            {/* تصدير */}
            <DropdownMenuItem
              icon={<Download className="h-4 w-4" />}
              onClick={() => { router.push(`/${locale}/settings`); setOpen(false); }}
            >
              {t('settings_export')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* جولة تعريفية */}
            <DropdownMenuItem
              icon={<HelpCircle className="h-4 w-4" />}
              onClick={() => { setTourActive(true); setOpen(false); }}
            >
              {t('settings_tour')}
            </DropdownMenuItem>

            {/* عداد الرموز */}
            <DropdownMenuItem
              icon={<Hash className="h-4 w-4" />}
              onClick={() => setOpen(false)}
            >
              {t('settings_tokens')}
            </DropdownMenuItem>

            {/* لوحة الإدارة */}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  icon={<Shield className="h-4 w-4" />}
                  onClick={() => { router.push(`/${locale}/admin`); setOpen(false); }}
                >
                  {t('settings_admin')}
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            {/* تسجيل الخروج */}
            <DropdownMenuItem
              icon={<LogOut className="h-4 w-4" />}
              destructive
              onClick={() => { setShowLogoutConfirm(true); setOpen(false); }}
            >
              {t('settings_logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* حوار تأكيد تسجيل الخروج */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title={tAuth('logout')}
        message={tAuth('logout_confirm')}
        confirmLabel={tAuth('logout')}
        destructive
        onConfirm={signOut}
      />
    </>
  );
}
