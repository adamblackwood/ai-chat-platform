// حقل إدخال الرسالة: حقل نص قابل للتوسيع 1-5 أسطر مع إرسال وأوامر مائلة
'use client';

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send, Square, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { TokenCounter } from '@/components/common/TokenCounter';
import { MessageCounter } from '@/components/common/MessageCounter';
import { SlashCommands } from './SlashCommands';
import { MESSAGE_LIMIT_PER_CHAT, UI_CONSTANTS } from '@/utils/constants';

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isSending: boolean;
  isStreaming: boolean;
  isDisabled: boolean;
  isRateLimited: boolean;
  messageCount: number;
  totalTokens: number;
  placeholder?: string;
  onSlashCommand?: (personaId: string) => void;
}

export function MessageInput({
  onSend,
  onStop,
  isSending,
  isStreaming,
  isDisabled,
  isRateLimited,
  messageCount,
  totalTokens,
  placeholder,
  onSlashCommand,
}: MessageInputProps) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [message, setMessage] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAtLimit = messageCount >= MESSAGE_LIMIT_PER_CHAT;
  const canSend = message.trim().length > 0 && !isSending && !isStreaming && !isDisabled && !isRateLimited && !isAtLimit;

  /**
   * تعديل ارتفاع مربع النص تلقائياً (1-5 أسطر)
   */
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const lineHeight = 24;
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;
    const newHeight = Math.min(Math.max(textarea.scrollHeight, lineHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
    return () => {};
  }, [message, adjustHeight]);

  /**
   * التعامل مع تغيير النص
   */
  const handleChange = useCallback(
    (value: string) => {
      if (value.length > UI_CONSTANTS.MAX_MESSAGE_LENGTH) return;
      setMessage(value);

      if (value === '/') {
        setSlashFilter('');
        setShowSlashMenu(true);
        setSelectedSlashIndex(0);
      } else if (value.startsWith('/') && !value.includes(' ') && value.length <= 20) {
        setSlashFilter(value.substring(1).toLowerCase());
        setShowSlashMenu(true);
        setSelectedSlashIndex(0);
      } else {
        setShowSlashMenu(false);
      }
    },
    []
  );

  /**
   * إرسال الرسالة
   */
  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(message.trim());
    setMessage('');
    setShowSlashMenu(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [message, canSend, onSend]);

  /**
   * اختيار أمر مائل
   */
  const handleSlashSelect = useCallback(
    (personaId: string) => {
      setMessage('');
      setShowSlashMenu(false);
      onSlashCommand?.(personaId);
      setTimeout(() => textareaRef.current?.focus(), 50);
    },
    [onSlashCommand]
  );

  /**
   * معالجة أحداث لوحة المفاتيح
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSlashMenu) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Tab') {
          e.preventDefault();
          setSelectedSlashIndex((prev) =>
            e.key === 'ArrowUp' ? Math.max(0, prev - 1) : prev + 1
          );
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowSlashMenu(false);
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [showSlashMenu, handleSend]
  );

  return (
    <div className="shrink-0 border-t border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md p-3">
      <div className="max-w-3xl mx-auto relative">
        {/* قائمة الأوامر المائلة */}
        <SlashCommands
          filter={slashFilter}
          selectedIndex={selectedSlashIndex}
          onSelect={handleSlashSelect}
          visible={showSlashMenu}
        />

        {/* حقل الإدخال */}
        <div
          className={cn(
            'flex items-end gap-2 rounded-xl border bg-white dark:bg-dark-800 transition-colors',
            'focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/30',
            isAtLimit
              ? 'border-red-300 dark:border-red-700'
              : isRateLimited
                ? 'border-orange-300 dark:border-orange-700'
                : 'border-gray-200 dark:border-dark-600',
            'px-3 py-2'
          )}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAtLimit
                ? t('message_limit_title')
                : isRateLimited
                  ? t('rate_limit_wait')
                  : placeholder ?? t('type_message')
            }
            disabled={isDisabled || isAtLimit}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent text-sm outline-none',
              'text-gray-700 dark:text-gray-300',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[24px] max-h-[120px] leading-6'
            )}
            dir="auto"
          />

          {isStreaming ? (
            <Tooltip content={t('stop')}>
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={onStop}
                className="shrink-0 rounded-lg"
                aria-label={t('stop')}
              >
                <Square className="h-4 w-4" />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content={t('send')}>
              <Button
                size="icon-sm"
                onClick={handleSend}
                disabled={!canSend}
                className="shrink-0 rounded-lg"
                aria-label={t('send')}
              >
                <Send className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
        </div>

        {/* شريط المعلومات السفلي */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <div className="flex items-center gap-3">
            <TokenCounter tokens={totalTokens} />
            <MessageCounter current={messageCount} />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
            {t('type_slash')}
          </p>
        </div>
      </div>
    </div>
  );
}
