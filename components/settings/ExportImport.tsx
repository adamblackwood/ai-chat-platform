// تصدير واستيراد البيانات: تصدير JSON شامل (بدون مفاتيح) واستيراد مع تحقق
'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Download, Upload, FileCode, AlertTriangle, Check,
  Shield, ArrowDownToLine, ArrowUpToLine,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useExport } from '@/hooks/useExport';

export function ExportImport() {
  const t = useTranslations('settings');
  const { isExporting, exportAllSettings, importSettings } = useExport();

  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * معالجة الاستيراد
   */
  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importSettings(file);
      if (result.success) {
        setImportResult({ type: 'success', message: t('import_success') });
      } else {
        setImportResult({
          type: 'error',
          message: result.error ?? t('import_error'),
        });
      }
    } catch {
      setImportResult({ type: 'error', message: t('import_error') });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* قسم التصدير */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5 text-primary-500" />
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('export_settings')}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('export_description')}
        </p>

        {/* ماذا يتضمن التصدير */}
        <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 space-y-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">يتضمن:</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
            <span>✅ المحادثات والرسائل</span>
            <span>✅ الشخصيات المخصصة</span>
            <span>✅ المجلدات</span>
            <span>✅ المفضلات</span>
            <span>✅ التفضيلات</span>
            <span className="text-red-400">❌ مفاتيح API</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-orange-500">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>{t('export_excludes')}</span>
        </div>

        <Button
          onClick={exportAllSettings}
          isLoading={isExporting}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t('export_button')}
        </Button>
      </div>

      {/* فاصل */}
      <div className="h-px bg-gray-200 dark:bg-dark-700" />

      {/* قسم الاستيراد */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowUpToLine className="h-5 w-5 text-primary-500" />
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('import_settings')}
          </span>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-600 p-6 text-center space-y-3">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            JSON ({t('export_button')})
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            isLoading={isImporting}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {t('import_button')}
          </Button>
        </div>

        {/* نتيجة الاستيراد */}
        {importResult?.type === 'success' && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="h-4 w-4" />
            <span>{importResult.message}</span>
          </div>
        )}

        {importResult?.type === 'error' && (
          <ErrorMessage
            message={importResult.message}
            dismissible
            onDismiss={() => setImportResult(null)}
          />
        )}
      </div>
    </div>
  );
}
