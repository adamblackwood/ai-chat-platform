// عنصر المجلد: مجلد قابل للطي مع اسم وعدد وإجراءات
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Folder as FolderIcon, FolderOpen, ChevronDown, ChevronLeft, ChevronRight,
  MoreHorizontal, Edit3, Trash2, MessageSquare,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLocale } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { truncateText } from '@/utils/helpers';
import type { Conversation } from '@/types/chat';
import type { Folder } from '@/types/folder';

/**
 * خصائص عنصر المجلد
 */
interface FolderItemProps {
  folder: Folder;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

/**
 * مكون عنصر المجلد
 */
export function FolderItem({
  folder,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDelete,
  onRename,
}: FolderItemProps) {
  const t = useTranslations('sidebar');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const isAutoFolder = folder.type === 'auto';

  /**
   * حفظ الاسم المعدل
   */
  const saveRename = useCallback(() => {
    if (editName.trim() && editName.trim() !== folder.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }, [editName, folder.name, onRename]);

  const Chevron = isOpen
    ? ChevronDown
    : isRTL
      ? ChevronLeft
      : ChevronRight;

  return (
    <div className="space-y-0.5">
      {/* رأس المجلد */}
      <div
        className={cn(
          'group flex items-center gap-1.5 rounded-lg px-2 py-1 cursor-pointer transition-colors',
          'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
        )}
      >
        {/* سهم الطي */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0 p-0.5"
          aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
        >
          <Chevron className="h-3 w-3" />
        </button>

        {/* أيقونة المجلد */}
        {isOpen ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-primary-500" />
        ) : (
          <FolderIcon className="h-4 w-4 shrink-0" />
        )}

        {/* الاسم أو حقل التعديل */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 bg-transparent text-xs outline-none border-b border-primary-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 text-start text-xs font-medium truncate"
          >
            {folder.name}
          </button>
        )}

        {/* شارة العدد */}
        {conversations.length > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {conversations.length}
          </Badge>
        )}

        {/* قائمة الإجراءات */}
        {!isAutoFolder && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger onClick={() => setMenuOpen(!menuOpen)}>
                <button
                  className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                  aria-label="Folder options"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              {menuOpen && (
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    icon={<Edit3 className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setIsEditing(true);
                      setEditName(folder.name);
                      setMenuOpen(false);
                    }}
                  >
                    {t('rename_folder')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => {
                      onDelete();
                      setMenuOpen(false);
                    }}
                  >
                    {t('delete_folder')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* المحادثات داخل المجلد */}
      {isOpen && (
        <div className="ps-6 space-y-0.5">
          {conversations.length === 0 ? (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 px-2 py-1">
              {t('no_conversations')}
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-start transition-colors',
                  conv.id === activeConversationId
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                )}
              >
                <MessageSquare className="h-3 w-3 shrink-0 opacity-60" />
                <span className="text-xs truncate">
                  {truncateText(conv.title, 25)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
