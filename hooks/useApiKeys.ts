// خطاف مفاتيح API: يدير إضافة وحذف وتعديل المفاتيح مع التشفير
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/authStore';
import { FREE_MAX_API_KEYS } from '@/utils/constants';
import type { ApiKey } from '@/types/api-key';
import type { Role } from '@/types/user';

interface UseApiKeysReturn {
  apiKeys: ApiKey[];
  isLoading: boolean;
  keyCount: number;
  maxKeys: number;
  isAtLimit: boolean;
  addKey: (platform: string, rawKey: string, label: string) => Promise<{ success: boolean; error?: string }>;
  removeKey: (id: string) => Promise<void>;
  updateKey: (id: string, updates: { label?: string; is_active?: boolean }) => Promise<void>;
  getDecryptedKey: (id: string) => Promise<string | null>;
  refreshKeys: () => Promise<void>;
}

export function useApiKeys(): UseApiKeysReturn {
  const supabase = createSupabaseBrowserClient();
  const { user, role } = useAuthStore();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);

  const maxKeys = role === 'free' ? FREE_MAX_API_KEYS : Infinity;
  const keyCount = apiKeys.filter((k) => !k.is_global).length;
  const isAtLimit = role === 'free' && keyCount >= FREE_MAX_API_KEYS;

  /**
   * تحميل المفاتيح
   */
  const refreshKeys = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_global', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setApiKeys(data as ApiKey[]);
      }
    } catch {
      // تجاهل
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  /**
   * إضافة مفتاح جديد
   */
  const addKey = useCallback(
    async (
      platform: string,
      rawKey: string,
      label: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not authenticated' };

      if (isAtLimit) {
        return { success: false, error: 'key_limit_reached' };
      }

      try {
        // تشفير المفتاح عبر API route
        const encryptResponse = await fetch('/api/admin/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'encrypt_and_save',
            platform,
            rawKey,
            label,
            userId: user.id,
            isGlobal: false,
          }),
        });

        if (!encryptResponse.ok) {
          const errData = await encryptResponse.json().catch(() => ({})) as Record<string, string>;
          return { success: false, error: errData.error ?? 'Failed to save key' };
        }

        await refreshKeys();
        return { success: true };
      } catch {
        return { success: false, error: 'Network error' };
      }
    },
    [user, isAtLimit, refreshKeys]
  );

  /**
   * حذف مفتاح
   */
  const removeKey = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', id)
          .eq('user_id', user?.id ?? '');

        if (!error) {
          setApiKeys((prev) => prev.filter((k) => k.id !== id));
        }
      } catch {
        // تجاهل
      }
    },
    [supabase, user]
  );

  /**
   * تحديث مفتاح
   */
  const updateKey = useCallback(
    async (id: string, updates: { label?: string; is_active?: boolean }) => {
      try {
        const { error } = await supabase
          .from('api_keys')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user?.id ?? '');

        if (!error) {
          setApiKeys((prev) =>
            prev.map((k) => (k.id === id ? { ...k, ...updates } : k))
          );
        }
      } catch {
        // تجاهل
      }
    },
    [supabase, user]
  );

  /**
   * الحصول على مفتاح مفكوك التشفير
   */
  const getDecryptedKey = useCallback(
    async (id: string): Promise<string | null> => {
      try {
        const response = await fetch(`/api/admin/api-keys?action=decrypt&keyId=${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) return null;

        const data = await response.json() as { decryptedKey?: string };
        return data.decryptedKey ?? null;
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (user && !loadedRef.current) {
      loadedRef.current = true;
      refreshKeys();
    }
    return () => {};
  }, [user, refreshKeys]);

  return {
    apiKeys,
    isLoading,
    keyCount,
    maxKeys: role === 'free' ? FREE_MAX_API_KEYS : -1,
    isAtLimit,
    addKey,
    removeKey,
    updateKey,
    getDecryptedKey,
    refreshKeys,
  };
}
