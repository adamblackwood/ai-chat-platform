// معلومات الرسالة: يعرض بيانات إضافية أسفل رسالة المساعد
'use client';

import { useState, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Sparkles, Cpu, Clock, Hash, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { copyToClipboard } from '@/utils/helpers';
import { formatTokenCount, formatResponseTime } from '@/utils/formatters';
import { Tooltip } from '@/components/ui/tooltip';
import type { Message } from '@/types/chat';

interface MessageInfoProps {
  message: Message;
  onRegenerate?: () => void;
}

export const MessageInfo = memo(function MessageInfo({
  message,
  onRegenerate,
}: MessageInfoProps) {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  const hasInfo = message.persona_name || message.model || message.tokens_used > 0 || message.response_time_ms;

  if (!hasInfo && !onRegenerate) return null;

  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 px-1">
      {/* الشخصية */}
      {message.persona_name && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <Sparkles className="h-3 w-3" />
          <span>{message.persona_name}</span>
        </div>
      )}

      {/* النموذج */}
      {message.model && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <Cpu className="h-3 w-3" />
          <span>{message.model.split('/').pop()}</span>
        </div>
      )}

      {/* الرموز */}
      {message.tokens_used > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <Hash className="h-3 w-3" />
          <span>{formatTokenCount(message.tokens_used)}</span>
        </div>
      )}

      {/* وقت الاستجابة */}
      {message.response_time_ms != null && message.response_time_ms > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatResponseTime(message.response_time_ms)}</span>
        </div>
      )}

      {/* الإجراءات */}
      <div className="flex items-center gap-1 ms-auto">
        {/* نسخ */}
        <Tooltip content={copied ? tCommon('copied') : t('copy_message')}>
          <button
            onClick={handleCopy}
            className={cn(
              'rounded p-1 transition-colors',
              copied
                ? 'text-green-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
            )}
            aria-label={t('copy_message')}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </Tooltip>

        {/* إعادة التوليد */}
        {onRegenerate && (
          <Tooltip content={t('regenerate')}>
            <button
              onClick={onRegenerate}
              className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              aria-label={t('regenerate')}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
});
