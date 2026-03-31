// أنواع المجلدات: نوع المجلد، المجلد مع المحادثات

/**
 * أنواع المجلدات
 */
export type FolderType = 'auto' | 'custom';

/**
 * المجلد - يطابق جدول folders
 */
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  type: FolderType;
  persona_id: string | null;
  sort_order: number;
  created_at: string;
}

/**
 * بيانات إنشاء مجلد جديد
 */
export interface CreateFolderData {
  name: string;
  type: FolderType;
  persona_id?: string;
  sort_order?: number;
}

/**
 * بيانات تحديث المجلد
 */
export interface UpdateFolderData {
  name?: string;
  sort_order?: number;
}

/**
 * المجلد مع عدد المحادثات
 */
export interface FolderWithCount extends Folder {
  conversation_count: number;
}
