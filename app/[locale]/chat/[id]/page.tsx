// صفحة محادثة محددة: تحميل المحادثة والرسائل وعرضها
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/utils/cn';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat } from '@/hooks/useChat';
import { useFolders } from '@/hooks/useFolders';
import { useUIStore } from '@/stores/uiStore';
import { usePlatformStore } from '@/stores/platformStore';
import { usePersonaStore } from '@/stores/personaStore';
import { useChatStore } from '@/stores/chatStore';
import { formatRelativeTime } from '@/utils/formatters';
import { MessageSquare, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * خصائص الصفحة
 */
interface ChatIdPageProps {
  params: { id: string; locale: string };
}

/**
 * صفحة محادثة محددة
 */
export default function ChatIdPage({ params }: ChatIdPageProps) {
  return (
    <RouteGuard>
      <ChatIdContent conversationId={params.id} />
    </RouteGuard>
  );
}

/**
 * محتوى صفحة المحادثة
 */
function ChatIdContent({ conversationId }: { conversationId: string }) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';

  const { sidebarOpen } = useUIStore();
  const { activePlatform, activeModel } = usePlatformStore();
  const { activePersona } = usePersonaStore();
  const { messages: storeMessages } = useChatStore();

  const {
    conversations,
    currentConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    loadConversation,
    loadMessages,
    createConversation,
    deleteConversation,
    updateConversation,
  } = useChat();

  const { folders, createFolder, deleteFolder, updateFolder } = useFolders();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  /**
   * تحميل المحادثة والرسائل
   */
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const init = async () => {
      setIsInitialLoading(true);
      const conv = await loadConversation(conversationId);

      if (!conv) {
        router.replace(`/${locale}/chat`);
        return;
      }

      await loadMessages(conversationId);
      setIsInitialLoading(false);
    };

    init();

    return () => {};
  }, [conversationId, loadConversation, loadMessages, router, locale]);

  /**
   * التمرير لأسفل عند إضافة رسائل
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    return () => {};
  }, [messages.length, storeMessages.length]);

  /**
   * محادثة جديدة
   */
  const handleNewChat = useCallback(async () => {
    const conv = await createConversation({
      platform: activePlatform,
      model: activeModel || 'default',
      persona_id: activePersona?.id ?? null,
    });
    if (conv) {
      router.push(`/${locale}/chat/${conv.id}`);
    }
  }, [createConversation, activePlatform, activeModel, activePersona, router, locale]);

  /**
   * اختيار محادثة
   */
  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id !== conversationId) {
        loadedRef.current = false;
        router.push(`/${locale}/chat/${id}`);
      }
    },
    [router, locale, conversationId]
  );

  // الرسائل المعروضة
  const displayMessages = storeMessages.length > 0 ? storeMessages : messages;

  return (
    <div className="flex h-screen bg-white dark:bg-dark-950">
      {/* الشريط الجانبي */}
      <Sidebar
        conversations={conversations}
        folders={folders}
        activeConversationId={conversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={async (id) => {
          await deleteConversation(id);
          if (id === conversationId) {
            router.replace(`/${locale}/chat`);
          }
        }}
        onRenameConversation={async (id, title) => {
          await updateConversation(id, { title });
        }}
        onMoveConversation={async (id, folderId) => {
          await updateConversation(id, { folder_id: folderId });
        }}
        onCreateFolder={async (name) => {
          await createFolder(name, 'custom');
        }}
        onDeleteFolder={deleteFolder}
        onRenameFolder={updateFolder}
        isLoadingConversations={isLoadingConversations}
      />

      {/* المحتوى الرئيسي */}
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarOpen
            ? isRTL ? 'lg:me-sidebar' : 'lg:ms-sidebar'
            : ''
        )}
      >
        {/* شريط علوي */}
        <div className="h-16 shrink-0 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-5 w-5 shrink-0 text-gray-400" />
            {isInitialLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <h1 className="text-base font-medium text-gray-700 dark:text-gray-300 truncate">
                {currentConversation?.title ?? t('new_conversation')}
              </h1>
            )}
          </div>
          {currentConversation && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{currentConversation.platform}</span>
              <span>•</span>
              <span>{currentConversation.model}</span>
            </div>
          )}
        </div>

        {/* منطقة الرسائل */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isInitialLoading ? (
            <div className="space-y-6 max-w-3xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <MessageSkeleton key={`msg-skel-${i}`} isUser={i % 2 === 0} />
              ))}
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 dark:text-gray-500">{t('no_messages')}</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {/* أيقونة المرسل */}
                  {msg.role !== 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
                      <Bot className="h-4 w-4 text-primary-500" />
                    </div>
                  )}

                  {/* فقاعة الرسالة */}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-ee-md'
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-800 dark:text-gray-200 rounded-es-md'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {/* معلومات إضافية */}
                    {msg.role === 'assistant' && msg.tokens_used > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                        {msg.tokens_used > 0 && <span>{msg.tokens_used} tokens</span>}
                        {msg.response_time_ms && <span>• {msg.response_time_ms}ms</span>}
                      </div>
                    )}
                  </div>

                  {/* أيقونة المستخدم */}
                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-dark-700">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* منطقة الإدخال - سيتم استبدالها بمكون MessageInput لاحقاً */}
        <div className="shrink-0 border-t border-gray-200 dark:border-dark-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-4 py-3">
              <input
                type="text"
                placeholder={t('type_message')}
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                disabled
              />
              <button
                className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                disabled
              >
                {t('send')}
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
              {t('type_slash')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * هيكل رسالة للتحميل
 */
function MessageSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <Skeleton circle className="h-8 w-8 shrink-0" />}
      <div className={cn('space-y-2', isUser ? 'items-end' : 'items-start')}>
        <Skeleton className={cn('h-4', isUser ? 'w-48' : 'w-64')} />
        <Skeleton className={cn('h-4', isUser ? 'w-32' : 'w-56')} />
        {!isUser && <Skeleton className="h-4 w-40" />}
      </div>
      {isUser && <Skeleton circle className="h-8 w-8 shrink-0" />}
    </div>
  );
}
