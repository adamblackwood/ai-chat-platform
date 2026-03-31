// كتلة الكود: عرض الكود مع تمييز اللغة وزر النسخ
'use client';

import { useState, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, FileCode } from 'lucide-react';
import { cn } from '@/utils/cn';
import { copyToClipboard } from '@/utils/helpers';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export const CodeBlock = memo(function CodeBlock({
  code,
  language,
  className,
}: CodeBlockProps) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  // تنسيق اسم اللغة
  const displayLanguage = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className={cn('rounded-lg overflow-hidden border border-dark-600 my-2', className)}>
      {/* شريط أعلى الكود */}
      <div className="flex items-center justify-between bg-dark-800 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <FileCode className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 font-mono">{displayLanguage}</span>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-all',
            copied
              ? 'text-green-400 bg-green-500/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
          )}
          aria-label={copied ? t('copied') : t('copy')}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span>{t('copied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>{t('copy')}</span>
            </>
          )}
        </button>
      </div>

      {/* محتوى الكود */}
      <div className="overflow-x-auto custom-scrollbar">
        <pre className="bg-dark-950 p-3 text-sm leading-relaxed">
          <code className={cn('font-mono text-gray-300', `language-${language}`)}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
});
