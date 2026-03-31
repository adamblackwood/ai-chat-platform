// الشريط العلوي: يحتوي على عنوان المحادثة ومحددات المنصة والنموذج والشخصية
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Menu, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { Tooltip } from '@/components/ui/tooltip';
import { PlatformSelector } from './PlatformSelector';
import { ModelSelector } from './ModelSelector';
import { PersonaSelector } from './PersonaSelector';
import { SettingsDropdown } from './SettingsDropdown';
import { MessageCounter } from '@/components/common/MessageCounter';
import type { Conversation } from '@/types/chat';

interface HeaderProps {
  conversation: Conversation | null;
  messageCount: number;
}

export function Header({ conversation, messageCount }: HeaderProps) {
  const t = useTranslations('header');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <header
      className={cn(
        'h-14 shrink-0 border-b border-gray-200 dark:border-dark-700',
        'bg-white/80 dark:bg-dark-900/80 backdrop-blur-md',
        'flex items-center justify-between gap-2 px-3 z-header'
      )}
    >
      {/* الجانب الأيسر / الأيمن: تبديل الشريط الجانبي + المحددات */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* زر تبديل الشريط الجانبي */}
        {!sidebarOpen && (
          <Tooltip content={t('menu')} side="bottom">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors shrink-0"
              aria-label={t('menu')}
            >
              {isRTL ? (
                <PanelRightOpen className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
          </Tooltip>
        )}

        {/* زر القائمة على الموبايل */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            'rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors shrink-0',
            sidebarOpen ? 'lg:hidden' : 'hidden'
          )}
          aria-label={t('menu')}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* محددات المنصة والنموذج */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          <PlatformSelector />
          <span className="text-gray-300 dark:text-dark-600 text-xs">/</span>
          <ModelSelector />
        </div>

        {/* محدد المنصة فقط على الموبايل */}
        <div className="sm:hidden flex items-center gap-1 min-w-0">
          <PlatformSelector compact />
        </div>
      </div>

      {/* الجانب الأيمن / الأيسر: الشخصية + العدادات + الإعدادات */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* محدد الشخصية */}
        <div className="hidden md:block">
          <PersonaSelector />
        </div>

        {/* عداد الرسائل */}
        {conversation && (
          <MessageCounter current={messageCount} />
        )}

        {/* قائمة الإعدادات */}
        <SettingsDropdown />
      </div>
    </header>
  );
}
