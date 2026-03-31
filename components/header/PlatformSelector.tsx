// محدد المنصة: قائمة منسدلة لاختيار منصة الذكاء الاصطناعي
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePlatformStore } from '@/stores/platformStore';
import { SUPPORTED_PLATFORMS } from '@/utils/constants';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { PlatformName } from '@/types/platform';

interface PlatformSelectorProps {
  compact?: boolean;
}

export function PlatformSelector({ compact = false }: PlatformSelectorProps) {
  const t = useTranslations('header');
  const { activePlatform, setPlatform } = usePlatformStore();
  const [open, setOpen] = useState(false);

  const currentPlatform = SUPPORTED_PLATFORMS.find((p) => p.name === activePlatform);

  const handleSelect = useCallback(
    (name: string) => {
      setPlatform(name as PlatformName);
      setOpen(false);
    },
    [setPlatform]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger onClick={() => setOpen(!open)}>
        <button
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
            'border border-gray-200 dark:border-dark-600',
            'hover:bg-gray-50 dark:hover:bg-dark-800',
            'text-gray-700 dark:text-gray-300'
          )}
          aria-label={t('select_platform')}
        >
          <span className="text-base leading-none">{currentPlatform?.icon ?? '🌐'}</span>
          {!compact && (
            <>
              <span className="font-medium truncate max-w-[100px]">
                {currentPlatform?.displayName ?? t('select_platform')}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      {open && (
        <DropdownMenuContent align="start" className="min-w-[200px]">
          <DropdownMenuLabel>{t('select_platform')}</DropdownMenuLabel>
          {SUPPORTED_PLATFORMS.map((platform) => (
            <DropdownMenuItem
              key={platform.name}
              onClick={() => handleSelect(platform.name)}
              className="justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{platform.icon}</span>
                <span>{platform.displayName}</span>
              </div>
              {activePlatform === platform.name && (
                <Check className="h-4 w-4 text-primary-500" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
