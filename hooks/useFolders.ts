// خطاف المجلدات: إدارة إنشاء وتعديل وحذف ونقل وإعادة ترتيب المجلدات
// يدعم المجلدات التلقائية عند أول استخدام لشخصية
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/authStore';
import type { Folder, FolderType } from '@/types/folder';

interface UseFoldersReturn {
  folders: Folder[];
  isLoading: boolean;
  loadFolders: () => Promise<void>;
  createFolder: (name: string, type: FolderType, personaId?: string) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string, moveConversationsTo?: string | null) => Promise<void>;
  moveConversation: (conversationId: string, folderId: string | null) => Promise<void>;
  reorderFolders: (orderedIds: string[]) => Promise<void>;
  getOrCreateAutoFolder: (personaId: string, personaName: string) => Promise<Folder | null>;
  getFolderById: (id: string) => Folder | undefined;
}

export function useFolders(): UseFoldersReturn {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuthStore();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);

  /**
   * تحميل المجلدات
   */
  const loadFolders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setFolders(data as Folder[]);
      }
    } catch {
      // تجاهل
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  /**
   * إنشاء مجلد جديد
   */
  const createFolder = useCallback(
    async (name: string, type: FolderType, personaId?: string): Promise<Folder | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name,
            type,
            persona_id: personaId ?? null,
            sort_order: folders.length,
          })
          .select()
          .single();

        if (error || !data) return null;

        const folder = data as Folder;
        setFolders((prev) => [...prev, folder]);
        return folder;
      } catch {
        return null;
      }
    },
    [supabase, user, folders.length]
  );

  /**
   * إعادة تسمية مجلد
   */
  const renameFolder = useCallback(
    async (id: string, name: string) => {
      try {
        const { error } = await supabase
          .from('folders')
          .update({ name })
          .eq('id', id);

        if (!error) {
          setFolders((prev) =>
            prev.map((f) => (f.id === id ? { ...f, name } : f))
          );
        }
      } catch {
        // تجاهل
      }
    },
    [supabase]
  );

  /**
   * حذف مجلد مع خيار نقل المحادثات
   */
  const deleteFolder = useCallback(
    async (id: string, moveConversationsTo?: string | null) => {
      try {
        // نقل المحادثات قبل الحذف
        const targetFolderId = moveConversationsTo === undefined ? null : moveConversationsTo;

        await supabase
          .from('conversations')
          .update({ folder_id: targetFolderId })
          .eq('folder_id', id);

        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', id);

        if (!error) {
          setFolders((prev) => prev.filter((f) => f.id !== id));
        }
      } catch {
        // تجاهل
      }
    },
    [supabase]
  );

  /**
   * نقل محادثة إلى مجلد
   */
  const moveConversation = useCallback(
    async (conversationId: string, folderId: string | null) => {
      try {
        await supabase
          .from('conversations')
          .update({ folder_id: folderId })
          .eq('id', conversationId);
      } catch {
        // تجاهل
      }
    },
    [supabase]
  );

  /**
   * إعادة ترتيب المجلدات
   */
  const reorderFolders = useCallback(
    async (orderedIds: string[]) => {
      try {
        const updates = orderedIds.map((id, index) =>
          supabase
            .from('folders')
            .update({ sort_order: index })
            .eq('id', id)
        );

        await Promise.all(updates);

        setFolders((prev) => {
          const sorted = [...prev].sort((a, b) => {
            const aIdx = orderedIds.indexOf(a.id);
            const bIdx = orderedIds.indexOf(b.id);
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
          });
          return sorted.map((f, i) => ({ ...f, sort_order: i }));
        });
      } catch {
        // تجاهل
      }
    },
    [supabase]
  );

  /**
   * الحصول على أو إنشاء مجلد تلقائي لشخصية
   */
  const getOrCreateAutoFolder = useCallback(
    async (personaId: string, personaName: string): Promise<Folder | null> => {
      // البحث عن مجلد تلقائي موجود لهذه الشخصية
      const existing = folders.find(
        (f) => f.type === 'auto' && f.persona_id === personaId
      );

      if (existing) return existing;

      // إنشاء مجلد تلقائي جديد
      return createFolder(personaName, 'auto', personaId);
    },
    [folders, createFolder]
  );

  /**
   * الحصول على مجلد بالمعرف
   */
  const getFolderById = useCallback(
    (id: string): Folder | undefined => {
      return folders.find((f) => f.id === id);
    },
    [folders]
  );

  /**
   * تحميل أولي
   */
  useEffect(() => {
    if (user && !loadedRef.current) {
      loadedRef.current = true;
      loadFolders();
    }
    return () => {};
  }, [user, loadFolders]);

  return {
    folders,
    isLoading,
    loadFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveConversation,
    reorderFolders,
    getOrCreateAutoFolder,
    getFolderById,
  };
}
