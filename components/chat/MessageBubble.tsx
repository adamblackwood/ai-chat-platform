// فقاعة الرسالة: عرض رسالة المستخدم أو المساعد مع التنسيق المناسب
'use client';

import { memo } from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StreamingText } from './StreamingText';
import { MessageInfo } from './MessageInfo';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isLast?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  isLast = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // رسائل النظام
  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="rounded-lg bg-gray-100 dark:bg-dark-800 px-4 py-2 max-w-md">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* أيقونة المساعد */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 mt-1">
          <Bot className="h-4.5 w-4.5 text-primary-500" />
        </div>
      )}

      {/* محتوى الرسالة */}
      <div className={cn('max-w-[80%] min-w-[60px]', isUser ? 'order-first' : '')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-primary-500 text-white rounded-ee-md'
              : 'bg-gray-100 dark:bg-dark-800 text-gray-800 dark:text-gray-200 rounded-es-md'
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          ) : isStreaming ? (
            <StreamingText content={message.content} />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* معلومات الرسالة (للمساعد فقط) */}
        {!isUser && !isStreaming && isLast && (
          <MessageInfo message={message} />
        )}
      </div>

      {/* أيقونة المستخدم */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-dark-700 mt-1">
          <UserIcon className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" />
        </div>
      )}
    </div>
  );
});
