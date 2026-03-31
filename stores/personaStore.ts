// مخزن الشخصيات: يحفظ الشخصية النشطة والمفضلات مع persist
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Persona } from '@/types/persona';

/**
 * واجهة مخزن الشخصيات
 */
interface PersonaStore {
  /** الشخصية النشطة حالياً */
  activePersona: Persona | null;
  /** قائمة معرفات الشخصيات المفضلة */
  favoritePersonaIds: string[];

  /** تعيين الشخصية النشطة */
  setActivePersona: (persona: Persona | null) => void;
  /** مسح الشخصية النشطة */
  clearPersona: () => void;
  /** إضافة شخصية للمفضلة */
  addFavoritePersona: (id: string) => void;
  /** إزالة شخصية من المفضلة */
  removeFavoritePersona: (id: string) => void;
  /** التحقق من وجود شخصية في المفضلة */
  isFavoritePersona: (id: string) => boolean;
}

/**
 * مخزن الشخصيات مع الحفظ المحلي
 */
export const usePersonaStore = create<PersonaStore>()(
  persist(
    (set, get) => ({
      activePersona: null,
      favoritePersonaIds: [],

      setActivePersona: (persona) => set({ activePersona: persona }),

      clearPersona: () => set({ activePersona: null }),

      addFavoritePersona: (id) =>
        set((state) => {
          if (state.favoritePersonaIds.includes(id)) {
            return state;
          }
          return {
            favoritePersonaIds: [...state.favoritePersonaIds, id],
          };
        }),

      removeFavoritePersona: (id) =>
        set((state) => ({
          favoritePersonaIds: state.favoritePersonaIds.filter(
            (favId) => favId !== id
          ),
        })),

      isFavoritePersona: (id) => {
        return get().favoritePersonaIds.includes(id);
      },
    }),
    {
      name: 'persona-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        favoritePersonaIds: state.favoritePersonaIds,
      }),
    }
  )
);
