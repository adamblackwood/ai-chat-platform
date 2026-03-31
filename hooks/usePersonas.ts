// هوك الشخصيات - جلب وإنشاء وتعديل وحذف ومشاركة وتقييم ونسخ وتجربة
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

import { getSupabaseBrowser } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { FREE_MAX_PERSONAS } from "@/utils/constants";

import type {
  Persona,
  PersonaCategory,
  PersonaType,
  CreatePersonaData,
  UpdatePersonaData,
  PersonaRating,
  PremiumPersonaTrial,
} from "@/types/persona";

/**
 * القيم المُرجعة من هوك الشخصيات
 */
interface UsePersonasReturn {
  personas: Persona[];
  systemPersonas: Persona[];
  premiumPersonas: Persona[];
  customPersonas: Persona[];
  communityPersonas: Persona[];
  activePersona: Persona | null;
  isLoading: boolean;
  customCount: number;
  canCreateCustom: boolean;
  fetchPersonas: () => Promise<void>;
  setActive: (persona: Persona | null) => void;
  clearActive: () => void;
  createPersona: (data: CreatePersonaData) => Promise<Persona | null>;
  updatePersona: (id: string, data: UpdatePersonaData) => Promise<boolean>;
  deletePersona: (id: string) => Promise<boolean>;
  sharePersona: (id: string) => Promise<boolean>;
  ratePersona: (personaId: string, rating: number) => Promise<boolean>;
  getUserRating: (personaId: string) => Promise<number | null>;
  copyPersona: (persona: Persona) => Promise<Persona | null>;
  checkTrialUsed: (personaId: string) => Promise<boolean>;
  useTrialMessage: (personaId: string) => Promise<boolean>;
}

/**
 * هوك إدارة الشخصيات الكامل
 */
export function usePersonas(): UsePersonasReturn {
  const supabase = getSupabaseBrowser();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const activePersona = usePersonaStore((s) => s.activePersona);
  const setActivePersona = usePersonaStore((s) => s.setActivePersona);
  const clearPersona = usePersonaStore((s) => s.clearPersona);

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  /**
   * جلب جميع الشخصيات المتاحة
   */
  const fetchPersonas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      if (isMountedRef.current) {
        setPersonas((data as Persona[]) ?? []);
      }
    } catch {
      // صامت
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [supabase]);

  /**
   * تعيين الشخصية النشطة
   */
  const setActive = useCallback(
    (persona: Persona | null) => {
      setActivePersona(persona);
    },
    [setActivePersona]
  );

  /**
   * مسح الشخصية النشطة
   */
  const clearActive = useCallback(() => {
    clearPersona();
  }, [clearPersona]);

  /**
   * إنشاء شخصية مخصصة جديدة
   */
  const createPersona = useCallback(
    async (data: CreatePersonaData): Promise<Persona | null> => {
      if (!user) return null;

      // التحقق من الحد للمستخدم المجاني
      if (role === "free") {
        const currentCustom = personas.filter(
          (p) => p.type === "custom" && p.user_id === user.id
        ).length;
        if (currentCustom >= FREE_MAX_PERSONAS) return null;
      }

      try {
        const { data: created, error } = await supabase
          .from("personas")
          .insert({
            user_id: user.id,
            name: data.name.trim(),
            description: data.description.trim(),
            system_prompt: data.system_prompt.trim(),
            icon_url: data.icon_url ?? null,
            category: data.category,
            type: data.type === "shared" ? "shared" : "custom",
            is_active: true,
            is_approved: false,
          })
          .select()
          .single();

        if (error) throw error;

        const newPersona = created as Persona;
        if (isMountedRef.current) {
          setPersonas((prev) => [newPersona, ...prev]);
        }

        // إشعار عند المشاركة
        if (data.type === "shared") {
          await supabase.from("notifications").insert({
            type: "persona_shared",
            title: "مشاركة شخصية جديدة",
            message: `قام ${user.email} بمشاركة شخصية: ${data.name}`,
            priority: "info",
            related_user_id: user.id,
            metadata: { persona_name: data.name, persona_id: newPersona.id },
          });
        }

        return newPersona;
      } catch {
        return null;
      }
    },
    [user, role, personas, supabase]
  );

  /**
   * تحديث شخصية
   */
  const updatePersona = useCallback(
    async (id: string, data: UpdatePersonaData): Promise<boolean> => {
      try {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description.trim();
        if (data.system_prompt !== undefined) updateData.system_prompt = data.system_prompt.trim();
        if (data.icon_url !== undefined) updateData.icon_url = data.icon_url;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.is_active !== undefined) updateData.is_active = data.is_active;
        if (data.is_approved !== undefined) updateData.is_approved = data.is_approved;

        const { error } = await supabase
          .from("personas")
          .update(updateData)
          .eq("id", id);

        if (error) throw error;

        if (isMountedRef.current) {
          setPersonas((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updateData } as Persona : p))
          );

          // تحديث الشخصية النشطة إذا كانت هي
          if (activePersona?.id === id) {
            setActivePersona({ ...activePersona, ...updateData } as Persona);
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    [supabase, activePersona, setActivePersona]
  );

  /**
   * حذف شخصية
   */
  const deletePersona = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("personas")
          .delete()
          .eq("id", id);

        if (error) throw error;

        if (isMountedRef.current) {
          setPersonas((prev) => prev.filter((p) => p.id !== id));
          if (activePersona?.id === id) {
            clearPersona();
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    [supabase, activePersona, clearPersona]
  );

  /**
   * مشاركة شخصية مع المجتمع
   */
  const sharePersona = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("personas")
          .update({
            type: "shared",
            is_approved: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        // إشعار
        const persona = personas.find((p) => p.id === id);
        if (persona) {
          await supabase.from("notifications").insert({
            type: "persona_shared",
            title: "مشاركة شخصية جديدة",
            message: `قام ${user.email} بمشاركة شخصية: ${persona.name}`,
            priority: "info",
            related_user_id: user.id,
            metadata: { persona_name: persona.name, persona_id: id },
          });
        }

        if (isMountedRef.current) {
          setPersonas((prev) =>
            prev.map((p) =>
              p.id === id ? { ...p, type: "shared" as PersonaType, is_approved: false } : p
            )
          );
        }
        return true;
      } catch {
        return false;
      }
    },
    [user, supabase, personas]
  );

  /**
   * تقييم شخصية (1-5)
   */
  const ratePersona = useCallback(
    async (personaId: string, rating: number): Promise<boolean> => {
      if (!user || rating < 1 || rating > 5) return false;

      try {
        // التحقق من تقييم سابق
        const { data: existing } = await supabase
          .from("persona_ratings")
          .select("id")
          .eq("persona_id", personaId)
          .eq("user_id", user.id)
          .single();

        if (existing) {
          // تحديث التقييم
          const { error } = await supabase
            .from("persona_ratings")
            .update({ rating })
            .eq("id", existing.id);

          if (error) throw error;
        } else {
          // إنشاء تقييم جديد
          const { error } = await supabase
            .from("persona_ratings")
            .insert({
              persona_id: personaId,
              user_id: user.id,
              rating,
            });

          if (error) throw error;
        }

        // إعادة جلب الشخصية المحدثة (المشغل يحدث المتوسط)
        const { data: updated } = await supabase
          .from("personas")
          .select("average_rating, rating_count")
          .eq("id", personaId)
          .single();

        if (updated && isMountedRef.current) {
          setPersonas((prev) =>
            prev.map((p) =>
              p.id === personaId
                ? {
                    ...p,
                    average_rating: updated.average_rating,
                    rating_count: updated.rating_count,
                  }
                : p
            )
          );
        }

        return true;
      } catch {
        return false;
      }
    },
    [user, supabase]
  );

  /**
   * جلب تقييم المستخدم لشخصية
   */
  const getUserRating = useCallback(
    async (personaId: string): Promise<number | null> => {
      if (!user) return null;

      try {
        const { data } = await supabase
          .from("persona_ratings")
          .select("rating")
          .eq("persona_id", personaId)
          .eq("user_id", user.id)
          .single();

        return data?.rating ?? null;
      } catch {
        return null;
      }
    },
    [user, supabase]
  );

  /**
   * نسخ شخصية كمخصصة
   */
  const copyPersona = useCallback(
    async (persona: Persona): Promise<Persona | null> => {
      return createPersona({
        name: `${persona.name} (نسخة)`,
        description: persona.description,
        system_prompt: persona.system_prompt,
        icon_url: persona.icon_url ?? undefined,
        category: persona.category as PersonaCategory,
        type: "custom",
      });
    },
    [createPersona]
  );

  /**
   * التحقق من استخدام التجربة المجانية لشخصية مميزة
   */
  const checkTrialUsed = useCallback(
    async (personaId: string): Promise<boolean> => {
      if (!user) return true;

      try {
        const { data } = await supabase
          .from("premium_persona_trials")
          .select("id")
          .eq("user_id", user.id)
          .eq("persona_id", personaId)
          .single();

        return !!data;
      } catch {
        return false;
      }
    },
    [user, supabase]
  );

  /**
   * استخدام رسالة تجريبية مجانية لشخصية مميزة
   */
  const useTrialMessage = useCallback(
    async (personaId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("premium_persona_trials")
          .insert({
            user_id: user.id,
            persona_id: personaId,
          });

        if (error) {
          // خطأ unique constraint يعني تم الاستخدام مسبقاً
          if (error.code === "23505") return false;
          throw error;
        }

        return true;
      } catch {
        return false;
      }
    },
    [user, supabase]
  );

  // تصنيف الشخصيات
  const systemPersonas = personas.filter((p) => p.type === "system");
  const premiumPersonas = personas.filter((p) => p.type === "premium");
  const customPersonas = personas.filter(
    (p) => p.type === "custom" && p.user_id === user?.id
  );
  const communityPersonas = personas.filter(
    (p) => p.type === "shared" && p.is_approved
  );
  const customCount = customPersonas.length;
  const canCreateCustom = role !== "free" || customCount < FREE_MAX_PERSONAS;

  useEffect(() => {
    isMountedRef.current = true;
    fetchPersonas();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchPersonas]);

  return {
    personas,
    systemPersonas,
    premiumPersonas,
    customPersonas,
    communityPersonas,
    activePersona,
    isLoading,
    customCount,
    canCreateCustom,
    fetchPersonas,
    setActive,
    clearActive,
    createPersona,
    updatePersona,
    deletePersona,
    sharePersona,
    ratePersona,
    getUserRating,
    copyPersona,
    checkTrialUsed,
    useTrialMessage,
  };
}
