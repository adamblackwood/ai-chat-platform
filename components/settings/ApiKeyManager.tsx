// مدير مفاتيح API: عرض وإضافة وحذف المفاتيح
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Key, Plus, Trash2, Edit3, AlertTriangle, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ApiKeyForm } from './ApiKeyForm';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useAuthStore } from '@/stores/authStore';
import { SUPPORTED_PLATFORMS } from '@/utils/constants';
import { formatRelativeTime } from '@/utils/formatters';

export function ApiKeyManager() {
  const t = useTranslations('settings');
  const { role } = useAuthStore();
  const {
    apiKeys, isLoading, keyCount, maxKeys, isAtLimit,
    addKey, removeKey, updateKey, refreshKeys,
  } = useApiKeys();

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * الحصول على معلومات المنصة
   */
  const getPlatformInfo = (platform: string) => {
    return SUPPORTED_PLATFORMS.find((p) => p.name === platform);
  };

  /**
   * حذف مفتاح
   */
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await removeKey(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  /**
   * إضافة مفتاح
   */
  const handleAdd = async (platform: string, rawKey: string, label: string) => {
    const result = await addKey(platform, rawKey, label);
    if (result.success) {
      setShowForm(false);
    }
    return result;
  };

  return (
    <div className="space-y-4">
      {/* رأس القسم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('api_keys_tab')}
          </h3>
          <Badge variant="secondary">
            {role === 'free'
              ? t('key_count', { count: `${keyCount}/${maxKeys}` })
              : t('key_count', { count: keyCount.toString() })}
          </Badge>
        </div>

        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          disabled={isAtLimit}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('add_key')}
        </Button>
      </div>

      {/* رسالة الحد */}
      {isAtLimit && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 p-3">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {t('key_limit_message', { limit: maxKeys.toString() })}
          </p>
        </div>
      )}

      {/* نموذج الإضافة */}
      {showForm && (
        <ApiKeyForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* قائمة المفاتيح */}
      {apiKeys.length === 0 && !isLoading ? (
        <EmptyState
          icon={Key}
          title={t('api_keys_tab')}
          description={t('add_key')}
          className="py-8"
        />
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => {
            const platformInfo = getPlatformInfo(key.platform);

            return (
              <div
                key={key.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                  key.is_active
                    ? 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800'
                    : 'border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 opacity-60'
                )}
              >
                {/* أيقونة المنصة */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-700 text-xl">
                  {platformInfo?.icon ?? '🔑'}
                </div>

                {/* المعلومات */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {key.label}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {platformInfo?.displayName ?? key.platform}
                    </Badge>
                    {!key.is_active && (
                      <Badge variant="warning" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {key.last_used_at && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-[11px] text-gray-400">
                        {formatRelativeTime(key.last_used_at)}
                      </span>
                    </div>
                  )}
                </div>

                {/* الإجراءات */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* تفعيل/تعطيل */}
                  <button
                    onClick={() => updateKey(key.id, { is_active: !key.is_active })}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    aria-label="Toggle active"
                  >
                    {key.is_active ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </button>

                  {/* حذف */}
                  <button
                    onClick={() => setDeleteId(key.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label={t('delete_key')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* حوار تأكيد الحذف */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={t('delete_key')}
        message={t('delete_key_confirm')}
        confirmLabel={t('delete_key')}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
