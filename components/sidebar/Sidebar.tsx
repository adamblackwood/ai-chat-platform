// الشريط الجانبي: يحتوي على البحث والمحادثات والمجلدات والمفضلات والشخصيات
// يتكيف مع الشاشة: ثابت على الديسكتوب، درج على التابلت، تراكب على الموبايل
// يظهر على اليمين في العربية واليسار في الإنجليزية
'use client';

import { useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, X, PanelRightOpen, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip } from '@/components/ui/tooltip';
import { Logo } from '@/components/common/Logo';
import { ConversationList } from './ConversationList';
import { FolderList } from './FolderList';
import { FavoritesList } from './FavoritesList';
import { PersonaList } from './PersonaList';
import { QuickSettings } from './QuickSettings';
import type { Conversation } from '@/types/chat';
import type { Folder } from '@/types/folder';

/**
 * خصائص الشريط الجانبي
 */
interface SidebarProps {
  conversations: Conversation[];
  folders: Folder[];
  activeConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onMoveConversation: (id: string, folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  isLoadingConversations: boolean;
}

/**
 * مكون الشريط الجانبي
 */
export function Sidebar({
  conversations,
  folders,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onMoveConversation,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  isLoadingConversations,
}: SidebarProps) {
  const t = useTranslations('sidebar');
  const locale = useLocale();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const isRTL = locale === 'ar';

  // إغلاق الشريط الجانبي على الشاشات الصغيرة عند النقر خارجه
  const handleOverlayClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  // الاستماع لتغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <>
      {/* تراكب خلفي للموبايل */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={cn(
          'fixed top-0 z-sidebar h-full w-sidebar flex flex-col',
          'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-dark-700',
          'transition-transform duration-300 ease-in-out',
          isRTL ? 'right-0 border-s' : 'left-0 border-e',
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full'
              : '-translate-x-full'
        )}
      >
        {/* رأس الشريط الجانبي */}
        <div className="flex items-center justify-between p-4 shrink-0">
          <Logo size="sm" />
          <div className="flex items-center gap-1">
            {/* زر إغلاق الموبايل */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* زر محادثة جديدة */}
        <div className="px-3 pb-2 shrink-0">
          <Button onClick={onNewChat} className="w-full gap-2" size="default">
            <Plus className="h-4 w-4" />
            {t('new_chat')}
          </Button>
        </div>

        <Separator />

        {/* المحتوى القابل للتمرير */}
        <ScrollArea className="flex-1 px-2 py-2">
          {/* المفضلات */}
          <FavoritesList />

          {/* المجلدات */}
          <FolderList
            folders={folders}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onCreateFolder={onCreateFolder}
            onDeleteFolder={onDeleteFolder}
            onRenameFolder={onRenameFolder}
          />

          <Separator className="my-2" />

          {/* قائمة المحادثات */}
          <ConversationList
            conversations={conversations.filter((c) => !c.folder_id)}
            activeConversationId={activeConversationId}
            folders={folders}
            onSelect={onSelectConversation}
            onDelete={onDeleteConversation}
            onRename={onRenameConversation}
            onMove={onMoveConversation}
            isLoading={isLoadingConversations}
          />

          <Separator className="my-2" />

          {/* قائمة الشخصيات */}
          <PersonaList />
        </ScrollArea>

        <Separator />

        {/* الإعدادات السريعة */}
        <QuickSettings />
      </aside>

      {/* زر فتح الشريط الجانبي عندما يكون مغلقاً */}
      {!sidebarOpen && (
        <Tooltip content={t('new_chat')} side={isRTL ? 'left' : 'right'}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={cn(
              'fixed top-4 z-30 rounded-lg p-2',
              'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400',
              'hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors shadow-md',
              isRTL ? 'right-4' : 'left-4'
            )}
            aria-label="Open sidebar"
          >
            {isRTL ? (
              <PanelRightOpen className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>
        </Tooltip>
      )}
    </>
  );
}
