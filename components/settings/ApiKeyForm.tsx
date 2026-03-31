// نموذج إضافة مفتاح API: اختيار المنصة وإدخال المفتاح والتسمية
'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Save, X, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SUPPORTED_PLATFORMS } from '@/utils/constants';
import { isValidApiKey } from '@/utils/validators';

interface ApiKeyFormProps {
  onSave: (platform: string, rawKey: string, label: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  initialPlatform?: string;
}

export function ApiKeyForm({ onSave, onCancel, initialPlatform }: ApiKeyFormProps) {
  const t = useTranslations('settings');

  const [platform, setPlatform] = useState(initialPlatform ?? '');
  const [rawKey, setRawKey] = useState('');
  const [label, setLabel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedPlatform = SUPPORTED_PLATFORMS.find((p) => p.name === platform);

  /**
   * التحقق من المفتاح
   */
  const isKeyValid = platform && rawKey && isValidApiKey(rawKey, platform);

  /**
   * معالجة الحفظ
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      if (!platform) {
        setError('اختر المنصة');
        return;
      }

      if (!rawKey.trim()) {
        setError('أدخل مفتاح API');
        return;
      }

      if (!isValidApiKey(rawKey, platform)) {
        setError(t('key_invalid'));
        return;
      }

      const keyLabel = label.trim() || `${selectedPlatform?.displayName ?? platform} Key`;

      setIsSaving(true);
      try {
        const result = await onSave(platform, rawKey.trim(), keyLabel);
        if (!result.success) {
          setError(result.error ?? 'Failed to save');
        }
      } catch {
        setError('Network error');
      } finally {
        setIsSaving(false);
      }
    },
    [platform, rawKey, label, selectedPlatform, onSave, t]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-4 space-y-4"
    >
      {/* اختيار المنصة */}
      <div className="space-y-2">
        <Label required>{t('platform_label')}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUPPORTED_PLATFORMS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlatform(p.name)}
              className={cn(
                'flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-all',
                platform === p.name
                  ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-gray-400'
              )}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="truncate text-xs font-medium">{p.displayName}</span>
              {platform === p.name && <Check className="h-3.5 w-3.5 ms-auto shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* مفتاح API */}
      <div className="space-y-2">
        <Label required>{t('key_label')}</Label>
        <div className="relative">
          <Input
            type={showKey ? 'text' : 'password'}
            value={rawKey}
            onChange={(e) => setRawKey(e.target.value)}
            placeholder={t('key_placeholder')}
            className="pe-10 font-mono text-sm"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showKey ? 'Hide key' : 'Show key'}
            tabIndex={-1}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {rawKey && platform && (
          <p className={cn('text-xs', isKeyValid ? 'text-green-500' : 'text-red-500')}>
            {isKeyValid ? '✓ Key format is valid' : '✗ Invalid key format for this platform'}
          </p>
        )}
      </div>

      {/* التسمية */}
      <div className="space-y-2">
        <Label>{t('label_label')}</Label>
        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('label_placeholder')}
        />
      </div>

      {/* رسالة الخطأ */}
      {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}

      {/* الأزرار */}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 me-1.5" />
          {t('cancel') ?? 'Cancel'}
        </Button>
        <Button
          type="submit"
          isLoading={isSaving}
          disabled={isSaving || !platform || !rawKey}
        >
          <Save className="h-4 w-4 me-1.5" />
          {t('save_key')}
        </Button>
      </div>
    </form>
  );
}
