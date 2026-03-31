// قائمة المفضلات: عرض الشخصيات والنماذج المفضلة
'use client';

import { useTranslations } from 'next-intl';
import { Star, Sparkles, Cpu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFavorites } from '@/hooks/useFavorites';
import { usePersonaStore } from '@/stores/personaStore';
import { usePlatformStore } from '@/stores/platformStore';
import { EmptyState } from '@/components/common/EmptyState';
import type { UserFavorite } from '@/types/database';

/**
 * مكون قائمة المفضلات
 */
export function FavoritesList() {
  const t = useTranslations('sidebar');
  const { favorites, isLoading } = useFavorites();
  const { setActivePersona } = usePersonaStore();
  const { setModel } = usePlatformStore();

  const personaFavorites = favorites.filter((f) => f.item_type === 'persona');
  const modelFavorites = favorites.filter((f) => f.item_type === 'model');

  if (favorites.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-1 mb-2">
      {/* رأس المفضلات */}
      <div className="flex items-center gap-1.5 px-2 py-1">
        <Star className="h-3 w-3 text-yellow-500" />
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {t('favorites')}
        </span>
      </div>

      {/* شخصيات مفضلة */}
      {personaFavorites.map((fav) => (
        <FavoriteItem key={fav.id} favorite={fav} type="persona" />
      ))}

      {/* نماذج مفضلة */}
      {modelFavorites.map((fav) => (
        <FavoriteItem key={fav.id} favorite={fav} type="model" />
      ))}
    </div>
  );
}

/**
 * عنصر مفضلة واحد
 */
function FavoriteItem({
  favorite,
  type,
}: {
  favorite: UserFavorite;
  type: 'persona' | 'model';
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 w-full rounded-lg px-2 py-1 text-start transition-colors',
        'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
      )}
    >
      {type === 'persona' ? (
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-500" />
      ) : (
        <Cpu className="h-3.5 w-3.5 shrink-0 text-secondary-500" />
      )}
      <span className="text-xs truncate">{favorite.item_id}</span>
    </button>
  );
}
