// منطقة الدردشة: عرض الرسائل مع التمرير التلقائي وحالة الترحيب
'use client';

import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Sparkles, Zap, PenTool, Mail, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types/chat';

interface ChatAreaProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  isLoading: boolean;
  onSuggestionClick?: (text: string) => void;
  children?: ReactNode;
}

export function ChatArea({
  messages,
  streamingContent,
  isStreaming,
  isLoading,
  onSuggestionClick,
  children,
}: ChatAreaProps) {
  const t = useTranslations('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  /**
   * التمرير إلى الأسفل
   */
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
    setIsUserScrolledUp(false);
    setShowScrollButton(false);
  }, []);

  /**
   * مراقبة التمرير لتحديد إذا كان المستخدم قد رجع للأعلى
   */
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const threshold = 150;

    if (distanceFromBottom > threshold) {
      setIsUserScrolledUp(true);
      setShowScrollButton(true);
    } else {
      setIsUserScrolledUp(false);
      setShowScrollButton(false);
    }
  }, []);

  /**
   * التمرير التلقائي عند وصول رسائل جديدة (إلا إذا رجع المستخدم للأعلى)
   */
  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom(messages.length > 0);
    }
    return () => {};
  }, [messages.length, streamingContent, isUserScrolledUp, scrollToBottom]);

  /**
   * الاقتراحات
   */
  const suggestions = [
    { icon: Sparkles, text: t('suggestion_1'), slash: '/linkedin' },
    { icon: Zap, text: t('suggestion_2'), slash: '/brainstorm' },
    { icon: PenTool, text: t('suggestion_3'), slash: '/prompt' },
    { icon: Mail, text: t('suggestion_4'), slash: '/email' },
  ];

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className={cn('flex gap-3', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
              {i % 2 !== 0 && <Skeleton circle className="h-8 w-8 shrink-0" />}
              <div className="space-y-2">
                <Skeleton className={cn('h-4', i % 2 === 0 ? 'w-48' : 'w-64')} />
                <Skeleton className={cn('h-4', i % 2 === 0 ? 'w-32' : 'w-56')} />
              </div>
              {i % 2 === 0 && <Skeleton circle className="h-8 w-8 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // حالة الترحيب (لا توجد رسائل)
  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('empty_welcome')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {t('empty_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.slash}
                  onClick={() => onSuggestionClick?.(s.text)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-gray-200 dark:border-dark-700',
                    'bg-white dark:bg-dark-800 p-4 text-start',
                    'hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group'
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-700 group-hover:bg-primary-500/10 transition-colors">
                    <Icon className="h-4 w-4 text-gray-500 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      {/* منطقة الرسائل */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto custom-scrollbar p-4"
      >
        <div className="max-w-3xl mx-auto space-y-1">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLast={index === messages.length - 1 && !isStreaming}
            />
          ))}

          {/* رسالة البث المباشر */}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming',
                conversation_id: '',
                role: 'assistant',
                content: streamingContent,
                model: null,
                platform: null,
                persona_name: null,
                tokens_used: 0,
                response_time_ms: null,
                created_at: new Date().toISOString(),
              }}
              isStreaming
              isLast
            />
          )}

          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {/* زر التمرير للأسفل */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(true)}
          className={cn(
            'absolute bottom-4 start-1/2 -translate-x-1/2 z-10',
            'flex items-center gap-1.5 rounded-full',
            'bg-gray-800 dark:bg-dark-600 text-white px-3 py-1.5',
            'shadow-lg hover:bg-gray-700 dark:hover:bg-dark-500 transition-colors',
            'text-xs font-medium animate-fade-in'
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
