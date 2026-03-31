// قائمة المجلدات: عرض المجلدات مع زر الإضافة
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FolderPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FolderItem } from './FolderItem';
import type { Conversation } from '@/types/chat';
import type { Folder } from '@/types/folder';

/**
 * خصائص قائمة المجلدات
 */
interface FolderListProps {
  folders: Folder[];
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
}

/**
 * مكون قائمة المجلدات
 */
export function FolderList({
  folders,
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
}: FolderListProps) {
  const t = useTranslations('sidebar');
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  /**
   * حفظ المجلد الجديد
   */
  const handleCreate = useCallback(() => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  }, [newFolderName, onCreateFolder]);

  if (folders.length === 0 && !isCreating) {
    return null;
  }

  return (
    <div className="space-y-1">
      {/* رأس المجلدات */}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {t('folders')}
        </span>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded p-0.5 text-gray-400 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          aria-label={t('add_folder')}
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* حقل إنشاء مجلد جديد */}
      {isCreating && (
        <div className="px-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewFolderName('');
              }
            }}
            placeholder={t('folder_name_placeholder')}
            className={cn(
              'w-full rounded-md border border-primary-500 bg-transparent',
              'px-2 py-1 text-xs text-gray-700 dark:text-gray-300',
              'placeholder:text-gray-400 focus:outline-none'
            )}
            autoFocus
          />
        </div>
      )}

      {/* عناصر المجلدات */}
      {folders.map((folder) => {
        const folderConversations = conversations.filter(
          (c) => c.folder_id === folder.id
        );
        return (
          <FolderItem
            key={folder.id}
            folder={folder}
            conversations={folderConversations}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onDelete={() => onDeleteFolder(folder.id)}
            onRename={(name) => onRenameFolder(folder.id, name)}
          />
        );
      })}
    </div>
  );
}
