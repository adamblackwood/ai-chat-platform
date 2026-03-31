// خطاف المفضلات: إدارة العناصر المفضلة (شخصيات ونماذج)
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/authStore';
import type { UserFavorite } from '@/types/database';

type FavoriteItemType = 'persona' | 'model';

interface UseFavoritesReturn {
  favorites: UserFavorite[];
  personaFavorites: UserFavorite[];
  modelFavorites: UserFavorite[];
  isLoading: boolean;
  addFavorite: (itemType: FavoriteItemType, itemId: string) => Promise<boolean>;
  removeFavorite: (itemType: FavoriteItemType, itemId: string) => Promise<boolean>;
  isFavorited: (itemType: FavoriteItemType, itemId: string) => boolean;
  reorderFavorites: (itemType: FavoriteItemType, orderedIds: string[]) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuthStore();

  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);

  /**
   * تحميل المفضلات
   */
  const refreshFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setFavorites(data as UserFavorite[]);
      }
    } catch {
      // تجاهل
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  /**
   * إضافة عنصر للمفضلة
   */
  const addFavorite = useCallback(
    async (itemType: FavoriteItemType, itemId: string): Promise<boolean> => {
      if (!user) return false;

      // التحقق من عدم الوجود مسبقاً
      const exists = favorites.some(
        (f) => f.item_type === itemType && f.item_id === itemId
      );
      if (exists) return true;

      try {
        const maxSort = favorites
          .filter((f) => f.item_type === itemType)
          .reduce((max, f) => Math.max(max, f.sort_order), -1);

        const { data, error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
            sort_order: maxSort + 1,
          })
          .select()
          .single();

        if (!error && data) {
          setFavorites((prev) => [...prev, data as UserFavorite]);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [supabase, user, favorites]
  );

  /**
   * إزالة عنصر من المفضلة
   */
  const removeFavorite = useCallback(
    async (itemType: FavoriteItemType, itemId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (!error) {
          setFavorites((prev) =>
            prev.filter(
              (f) => !(f.item_type === itemType && f.item_id === itemId)
            )
          );
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [supabase, user]
  );

  /**
   * التحقق من وجود عنصر في المفضلة
   */
  const isFavorited = useCallback(
    (itemType: FavoriteItemType, itemId: string): boolean => {
      return favorites.some(
        (f) => f.item_type === itemType && f.item_id === itemId
      );
    },
    [favorites]
  );

  /**
   * إعادة ترتيب المفضلات
   */
  const reorderFavorites = useCallback(
    async (itemType: FavoriteItemType, orderedIds: string[]) => {
      if (!user) return;

      try {
        const updates = orderedIds.map((itemId, index) =>
          supabase
            .from('user_favorites')
            .update({ sort_order: index })
            .eq('user_id', user.id)
            .eq('item_type', itemType)
            .eq('item_id', itemId)
        );

        await Promise.all(updates);

        setFavorites((prev) => {
          const others = prev.filter((f) => f.item_type !== itemType);
          const typed = prev
            .filter((f) => f.item_type === itemType)
            .sort((a, b) => {
              const aIdx = orderedIds.indexOf(a.item_id);
              const bIdx = orderedIds.indexOf(b.item_id);
              return aIdx - bIdx;
            })
            .map((f, i) => ({ ...f, sort_order: i }));
          return [...others, ...typed];
        });
      } catch {
        // تجاهل
      }
    },
    [supabase, user]
  );

  /**
   * المفضلات المصفاة حسب النوع
   */
  const personaFavorites = favorites.filter((f) => f.item_type === 'persona');
  const modelFavorites = favorites.filter((f) => f.item_type === 'model');

  useEffect(() => {
    if (user && !loadedRef.current) {
      loadedRef.current = true;
      refreshFavorites();
    }
    return () => {};
  }, [user, refreshFavorites]);

  return {
    favorites,
    personaFavorites,
    modelFavorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorited,
    reorderFavorites,
    refreshFavorites,
  };
}
