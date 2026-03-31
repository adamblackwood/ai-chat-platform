// صفحة الدردشة الرئيسية: التخطيط الكامل مع الشريط الجانبي ومنطقة الدردشة
'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { MessageSquare, Sparkles, Zap, PenTool, Mail } from 'lucide-react';
import { cn } from '@/utils/cn';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { EmptyState } from '@/components/common/EmptyState';
import { useChat } from '@/hooks/useChat';
import { useFolders } from '@/hooks/useFolders';
import { useUIStore } from '@/stores/uiStore';
import { usePlatformStore } from '@/stores/platformStore';
import { usePersonaStore } from '@/stores/personaStore';
import { Button } from '@/components/ui/button';

/**
 * صفحة الدردشة الرئيسية
 */
export default function ChatPage() {
  return (
    <RouteGuard>
      <ChatPageContent />
    </RouteGuard>
  );
}

/**
 * محتوى صفحة الدردشة
 */
function ChatPageContent() {
  const t = useTranslations('chat');
  const tSidebar = useTranslations('sidebar');
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';

  const { sidebarOpen } = useUIStore();
  const { activePlatform, activeModel } = usePlatformStore();
  const { activePersona } = usePersonaStore();

  const {
    conversations,
    isLoadingConversations,
    createConversation,
    deleteConversation,
    updateConversation,
  } = useChat();

  const {
    folders,
    createFolder,
    deleteFolder,
    updateFolder,
  } = useFolders();

  /**
   * إنشاء محادثة جديدة
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
      router.push(`/${locale}/chat/${id}`);
    },
    [router, locale]
  );

  /**
   * حذف محادثة
   */
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation(id);
    },
    [deleteConversation]
  );

  /**
   * إعادة تسمية محادثة
   */
  const handleRenameConversation = useCallback(
    async (id: string, title: string) => {
      await updateConversation(id, { title });
    },
    [updateConversation]
  );

  /**
   * نقل محادثة لمجلد
   */
  const handleMoveConversation = useCallback(
    async (id: string, folderId: string | null) => {
      await updateConversation(id, { folder_id: folderId });
    },
    [updateConversation]
  );

  /**
   * إنشاء مجلد
   */
  const handleCreateFolder = useCallback(
    async (name: string) => {
      await createFolder(name, 'custom');
    },
    [createFolder]
  );

  /**
   * اقتراحات البداية
   */
  const suggestions = [
    { icon: Sparkles, text: t('suggestion_1'), command: '/linkedin' },
    { icon: Zap, text: t('suggestion_2'), command: '/brainstorm' },
    { icon: PenTool, text: t('suggestion_3'), command: '/prompt' },
    { icon: Mail, text: t('suggestion_4'), command: '/email' },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-dark-950">
      {/* الشريط الجانبي */}
      <Sidebar
        conversations={conversations}
        folders={folders}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onMoveConversation={handleMoveConversation}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={deleteFolder}
        onRenameFolder={updateFolder}
        isLoadingConversations={isLoadingConversations}
      />

      {/* المحتوى الرئيسي */}
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarOpen
            ? isRTL
              ? 'lg:me-sidebar'
              : 'lg:ms-sidebar'
            : ''
        )}
      >
        {/* شريط علوي مبسط - سيتم استبداله بمكون Header لاحقاً */}
        <div className="h-16 shrink-0 border-b border-gray-200 dark:border-dark-700 flex items-center px-4">
          <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {t('new_conversation')}
          </h1>
        </div>

        {/* منطقة الترحيب */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* رسالة الترحيب */}
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

            {/* أزرار الاقتراحات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.command}
                    onClick={handleNewChat}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border border-gray-200 dark:border-dark-700',
                      'bg-white dark:bg-dark-800 p-4 text-start',
                      'hover:border-primary-500/50 hover:bg-primary-500/5 transition-all duration-200',
                      'group'
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-700 group-hover:bg-primary-500/10 transition-colors">
                      <Icon className="h-4.5 w-4.5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      {suggestion.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* زر بدء محادثة */}
            <Button onClick={handleNewChat} size="lg" className="shadow-lg shadow-primary-500/20">
              {t('start_new')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
