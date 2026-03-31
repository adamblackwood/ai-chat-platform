// أنواع قاعدة البيانات الكاملة - تعريف TypeScript لجميع الجداول الـ 14
// يُستخدم مع عميل Supabase للحصول على أمان أنواع كامل

/**
 * تعريف قاعدة البيانات الكامل لـ Supabase
 * يشمل جميع الجداول مع أنواع Row و Insert و Update
 */
export interface Database {
  public: {
    Tables: {
      /** جدول الملفات الشخصية */
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: "admin" | "premium" | "free";
          is_super_admin: boolean;
          premium_expires_at: string | null;
          trial_used: boolean;
          trial_expires_at: string | null;
          is_banned: boolean;
          onboarding_completed: boolean;
          preferred_language: string;
          preferred_theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          role?: "admin" | "premium" | "free";
          is_super_admin?: boolean;
          premium_expires_at?: string | null;
          trial_used?: boolean;
          trial_expires_at?: string | null;
          is_banned?: boolean;
          onboarding_completed?: boolean;
          preferred_language?: string;
          preferred_theme?: string;
        };
        Update: {
          email?: string;
          display_name?: string | null;
          role?: "admin" | "premium" | "free";
          is_super_admin?: boolean;
          premium_expires_at?: string | null;
          trial_used?: boolean;
          trial_expires_at?: string | null;
          is_banned?: boolean;
          onboarding_completed?: boolean;
          preferred_language?: string;
          preferred_theme?: string;
          updated_at?: string;
        };
      };
      /** جدول المحادثات */
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          persona_id: string | null;
          platform: string;
          model: string;
          folder_id: string | null;
          is_favorited: boolean;
          message_count: number;
          total_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          persona_id?: string | null;
          platform: string;
          model: string;
          folder_id?: string | null;
          is_favorited?: boolean;
          message_count?: number;
          total_tokens?: number;
        };
        Update: {
          user_id?: string;
          title?: string;
          persona_id?: string | null;
          platform?: string;
          model?: string;
          folder_id?: string | null;
          is_favorited?: boolean;
          message_count?: number;
          total_tokens?: number;
          updated_at?: string;
        };
      };
      /** جدول الرسائل */
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          model: string | null;
          platform: string | null;
          persona_name: string | null;
          tokens_used: number;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          model?: string | null;
          platform?: string | null;
          persona_name?: string | null;
          tokens_used?: number;
          response_time_ms?: number | null;
        };
        Update: {
          conversation_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          model?: string | null;
          platform?: string | null;
          persona_name?: string | null;
          tokens_used?: number;
          response_time_ms?: number | null;
        };
      };
      /** جدول الشخصيات */
      personas: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string;
          system_prompt: string;
          icon_url: string | null;
          category: string;
          type: "system" | "premium" | "custom" | "shared";
          is_active: boolean;
          is_approved: boolean;
          average_rating: number;
          rating_count: number;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description: string;
          system_prompt: string;
          icon_url?: string | null;
          category: string;
          type: "system" | "premium" | "custom" | "shared";
          is_active?: boolean;
          is_approved?: boolean;
          average_rating?: number;
          rating_count?: number;
          usage_count?: number;
        };
        Update: {
          user_id?: string | null;
          name?: string;
          description?: string;
          system_prompt?: string;
          icon_url?: string | null;
          category?: string;
          type?: "system" | "premium" | "custom" | "shared";
          is_active?: boolean;
          is_approved?: boolean;
          average_rating?: number;
          rating_count?: number;
          usage_count?: number;
          updated_at?: string;
        };
      };
      /** جدول تقييمات الشخصيات */
      persona_ratings: {
        Row: {
          id: string;
          persona_id: string;
          user_id: string;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          persona_id: string;
          user_id: string;
          rating: number;
        };
        Update: {
          persona_id?: string;
          user_id?: string;
          rating?: number;
        };
      };
      /** جدول مفاتيح API */
      api_keys: {
        Row: {
          id: string;
          user_id: string | null;
          platform: string;
          encrypted_key: string;
          label: string;
          is_global: boolean;
          is_active: boolean;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          platform: string;
          encrypted_key: string;
          label: string;
          is_global?: boolean;
          is_active?: boolean;
          last_used_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          platform?: string;
          encrypted_key?: string;
          label?: string;
          is_global?: boolean;
          is_active?: boolean;
          last_used_at?: string | null;
        };
      };
      /** جدول النماذج العامة */
      global_models: {
        Row: {
          id: string;
          api_key_id: string;
          model_id: string;
          model_name: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          api_key_id: string;
          model_id: string;
          model_name: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          api_key_id?: string;
          model_id?: string;
          model_name?: string;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      /** جدول المجلدات */
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "auto" | "custom";
          persona_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "auto" | "custom";
          persona_id?: string | null;
          sort_order?: number;
        };
        Update: {
          user_id?: string;
          name?: string;
          type?: "auto" | "custom";
          persona_id?: string | null;
          sort_order?: number;
        };
      };
      /** جدول أكواد الدعوة */
      invite_codes: {
        Row: {
          id: string;
          code: string;
          created_by: string;
          max_uses: number;
          current_uses: number;
          premium_duration_days: number | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          created_by: string;
          max_uses?: number;
          current_uses?: number;
          premium_duration_days?: number | null;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: {
          code?: string;
          created_by?: string;
          max_uses?: number;
          current_uses?: number;
          premium_duration_days?: number | null;
          is_active?: boolean;
          expires_at?: string | null;
        };
      };
      /** جدول استخدامات أكواد الدعوة */
      invite_code_uses: {
        Row: {
          id: string;
          invite_code_id: string;
          user_id: string;
          used_at: string;
        };
        Insert: {
          id?: string;
          invite_code_id: string;
          user_id: string;
        };
        Update: {
          invite_code_id?: string;
          user_id?: string;
          used_at?: string;
        };
      };
      /** جدول الإشعارات */
      notifications: {
        Row: {
          id: string;
          type: string;
          title: string;
          message: string;
          priority: "urgent" | "normal" | "info";
          is_read: boolean;
          related_user_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          message: string;
          priority?: "urgent" | "normal" | "info";
          is_read?: boolean;
          related_user_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          type?: string;
          title?: string;
          message?: string;
          priority?: "urgent" | "normal" | "info";
          is_read?: boolean;
          related_user_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
      /** جدول تجارب الشخصيات المميزة */
      premium_persona_trials: {
        Row: {
          id: string;
          user_id: string;
          persona_id: string;
          used_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          persona_id: string;
        };
        Update: {
          user_id?: string;
          persona_id?: string;
          used_at?: string;
        };
      };
      /** جدول المفضلات */
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          item_type: "persona" | "model";
          item_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: "persona" | "model";
          item_id: string;
          sort_order?: number;
        };
        Update: {
          user_id?: string;
          item_type?: "persona" | "model";
          item_id?: string;
          sort_order?: number;
        };
      };
      /** جدول إحصائيات الاستخدام */
      usage_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          messages_sent: number;
          tokens_used: number;
          conversations_created: number;
          persona_id_most_used: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          messages_sent?: number;
          tokens_used?: number;
          conversations_created?: number;
          persona_id_most_used?: string | null;
        };
        Update: {
          user_id?: string;
          date?: string;
          messages_sent?: number;
          tokens_used?: number;
          conversations_created?: number;
          persona_id_most_used?: string | null;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      check_premium_expiry: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      check_trial_expiry: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
  };
}

/** اختصار لنوع صف من جدول معين */
export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** اختصار لنوع إدراج في جدول معين */
export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** اختصار لنوع تحديث في جدول معين */
export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
