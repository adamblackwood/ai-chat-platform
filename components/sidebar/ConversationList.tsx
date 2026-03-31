// قائمة المحادثات: عرض المحادثات مع البحث والقائمة السياقية
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  MessageSquare, Search, MoreHorizontal, Edit3, Trash2,
  FolderInput, Download, Star, StarOff,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { truncateText } from '@/utils/helpers';
import { formatRelativeTime } from '@/utils/formatters';
import { debounce } from '@/utils/helpers';
import type { Conversation } from '@/types/chat';
import type { Folder } from '@/types/folder';

/**
 * خصائص قائمة المحادثات
 */
interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  folders: Folder[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onMove: (id: string, folderId: string | null) => void;
  isLoading: boolean;
}

/**
 * مكون قائمة المحادثات
 */
export function ConversationList({
  conversations,
  activeConversationId,
  folders,
  onSelect,
  onDelete,
  onRename,
  onMove,
  isLoading,
}: ConversationListProps) {
  const t = useTranslations('sidebar');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);

  /**
   * تصفية المحادثات بالبحث
   */
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const lower = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.platform.toLowerCase().includes(lower)
    );
  }, [conversations, searchQuery]);

  /**
   * تجميع المحادثات حسب التاريخ
   */
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: Record<string, Conversation[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    filteredConversations.forEach((conv) => {
      const date = new Date(conv.updated_at);
      if (date >= today) {
        groups.today.push(conv);
      } else if (date >= yesterday) {
        groups.yesterday.push(conv);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  /**
   * معالجة البحث المتأخر
   */
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  /**
   * بدء تعديل العنوان
   */
  const startRename = useCallback((conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  }, []);

  /**
   * حفظ العنوان المعدل
   */
  const saveRename = useCallback(
    (id: string) => {
      if (editTitle.trim()) {
        onRename(id, editTitle.trim());
      }
      setEditingId(null);
      setEditTitle('');
    },
    [editTitle, onRename]
  );

  /**
   * عرض هيكل التحميل
   */
  if (isLoading) {
    return (
      <div className="space-y-2 p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="flex items-center gap-2 p-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  /**
   * عرض الحالة الفارغة
   */
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={t('no_conversations')}
        description={t('start_new_chat')}
        className="py-8"
      />
    );
  }

  /**
   * عرض مجموعة محادثات
   */
  const renderGroup = (label: string, convs: Conversation[]) => {
    if (convs.length === 0) return null;

    return (
      <div key={label} className="mb-2">
        <p className="px-2 py-1 text-xs font-medium text-gray-400 dark:text-gray-500">
          {label}
        </p>
        {convs.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            isEditing={editingId === conv.id}
            editTitle={editTitle}
            menuOpen={menuOpenId === conv.id}
            moveMenuOpen={moveMenuId === conv.id}
            folders={folders}
            locale={locale}
            onSelect={() => onSelect(conv.id)}
            onStartRename={() => startRename(conv)}
            onSaveRename={() => saveRename(conv.id)}
            onCancelRename={() => setEditingId(null)}
            onEditTitleChange={setEditTitle}
            onDelete={() => { onDelete(conv.id); setMenuOpenId(null); }}
            onMove={(folderId) => { onMove(conv.id, folderId); setMoveMenuId(null); }}
            onMenuToggle={() => setMenuOpenId(menuOpenId === conv.id ? null : conv.id)}
            onMoveMenuToggle={() => setMoveMenuId(moveMenuId === conv.id ? null : conv.id)}
            t={t}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* حقل البحث */}
      <div className="px-1 pb-2">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            onChange={(e) => debouncedSearch(e.target.value)}
            className={cn(
              'w-full rounded-lg border-0 bg-gray-100 dark:bg-dark-800',
              'ps-8 pe-3 py-1.5 text-xs',
              'text-gray-700 dark:text-gray-300',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-primary-500'
            )}
          />
        </div>
      </div>

      {/* مجموعات المحادثات */}
      {renderGroup(t('today'), groupedConversations.today)}
      {renderGroup(t('yesterday'), groupedConversations.yesterday)}
      {renderGroup(t('this_week'), groupedConversations.thisWeek)}
      {renderGroup(t('older'), groupedConversations.older)}
    </div>
  );
}

/**
 * خصائص عنصر المحادثة
 */
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  menuOpen: boolean;
  moveMenuOpen: boolean;
  folders: Folder[];
  locale: string;
  onSelect: () => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onEditTitleChange: (title: string) => void;
  onDelete: () => void;
  onMove: (folderId: string | null) => void;
  onMenuToggle: () => void;
  onMoveMenuToggle: () => void;
  t: ReturnType<typeof useTranslations>;
}

/**
 * عنصر محادثة واحد
 */
function ConversationItem({
  conversation,
  isActive,
  isEditing,
  editTitle,
  menuOpen,
  folders,
  locale,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditTitleChange,
  onDelete,
  onMove,
  onMenuToggle,
  t,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors',
        isActive
          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
      )}
    >
      <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onBlur={onSaveRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveRename();
            if (e.key === 'Escape') onCancelRename();
          }}
          className="flex-1 bg-transparent text-sm outline-none border-b border-primary-500"
          autoFocus
        />
      ) : (
        <button
          onClick={onSelect}
          className="flex-1 text-start text-sm truncate"
          title={conversation.title}
        >
          {truncateText(conversation.title, 30)}
        </button>
      )}

      {/* قائمة السياق */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <DropdownMenu open={menuOpen} onOpenChange={() => onMenuToggle()}>
          <DropdownMenuTrigger onClick={onMenuToggle}>
            <button
              className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          {menuOpen && (
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                icon={<Edit3 className="h-3.5 w-3.5" />}
                onClick={onStartRename}
              >
                {t('rename')}
              </DropdownMenuItem>
              {folders.length > 0 && (
                <DropdownMenuItem
                  icon={<FolderInput className="h-3.5 w-3.5" />}
                  onClick={() => {
                    const firstFolder = folders[0];
                    if (firstFolder) onMove(firstFolder.id);
                  }}
                >
                  {t('move_to_folder')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                icon={<Download className="h-3.5 w-3.5" />}
                onClick={() => {/* سيتم تنفيذ التصدير لاحقاً */}}
              >
                {t('export')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={onDelete}
              >
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </div>
  );
}
