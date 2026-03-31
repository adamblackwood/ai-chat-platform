// محدد النموذج: قائمة منسدلة ديناميكية حسب المنصة المختارة
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Check, Loader2, Cpu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePlatformStore } from '@/stores/platformStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Model } from '@/types/platform';

interface GlobalModelRow {
  id: string;
  model_id: string;
  model_name: string;
  is_active: boolean;
  api_key_id: string;
  api_keys: {
    platform: string;
    is_active: boolean;
    is_global: boolean;
  } | null;
}

export function ModelSelector() {
  const t = useTranslations('header');
  const supabase = createSupabaseBrowserClient();
  const { activePlatform, activeModel, apiType, setModel, setAvailableModels, availableModels } =
    usePlatformStore();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastPlatformRef = useRef<string>('');

  /**
   * تحميل النماذج العامة من قاعدة البيانات
   */
  const loadGlobalModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('global_models')
        .select('id, model_id, model_name, is_active, api_key_id, api_keys!inner(platform, is_active, is_global)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error || !data) {
        setAvailableModels([]);
        return;
      }

      const rows = data as unknown as GlobalModelRow[];
      const platformModels = rows
        .filter((m) => {
          const key = m.api_keys;
          return key && key.platform === activePlatform && key.is_active && key.is_global;
        })
        .map((m): Model => ({
          id: m.model_id,
          name: m.model_name,
        }));

      setAvailableModels(platformModels);

      if (platformModels.length > 0 && !activeModel) {
        const first = platformModels[0];
        if (first) {
          setModel(first.id);
        }
      }
    } catch {
      setAvailableModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, activePlatform, activeModel, setModel, setAvailableModels]);

  /**
   * تحميل النماذج عند تغيير المنصة
   */
  useEffect(() => {
    if (lastPlatformRef.current !== activePlatform) {
      lastPlatformRef.current = activePlatform;
      if (apiType === 'global') {
        loadGlobalModels();
      }
    }
    return () => {};
  }, [activePlatform, apiType, loadGlobalModels]);

  const handleSelect = useCallback(
    (modelId: string) => {
      setModel(modelId);
      setOpen(false);
    },
    [setModel]
  );

  const displayName = activeModel
    ? availableModels.find((m) => m.id === activeModel)?.name ?? activeModel.split('/').pop() ?? activeModel
    : t('select_model');

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
          aria-label={t('select_model')}
        >
          <Cpu className="h-3.5 w-3.5 opacity-50 shrink-0" />
          <span className="font-medium truncate max-w-[140px]">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      {open && (
        <DropdownMenuContent align="start" className="min-w-[240px] max-h-[300px] overflow-y-auto custom-scrollbar">
          <DropdownMenuLabel>{t('select_model')}</DropdownMenuLabel>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
            </div>
          ) : availableModels.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('no_model')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('add_api_key_hint')}</p>
            </div>
          ) : (
            availableModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => handleSelect(model.id)}
                className="justify-between"
              >
                <span className="truncate">{model.name}</span>
                {activeModel === model.id && (
                  <Check className="h-4 w-4 text-primary-500 shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
