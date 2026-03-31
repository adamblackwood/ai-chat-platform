// مدير النماذج - إضافة ومسح وترتيب وتبديل نشاط النماذج العامة
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Download,
  Loader2,
  GripVertical,
  X,
} from "lucide-react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { SUPPORTED_PLATFORMS } from "@/utils/constants";
import { cn } from "@/utils/cn";

import type { GlobalModel, ApiKey } from "@/types/api-key";

/**
 * مدير النماذج العامة
 */
export default function ModelsManager() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const supabase = getSupabaseBrowser();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [models, setModels] = useState<GlobalModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModelId, setNewModelId] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  /**
   * جلب المفاتيح والنماذج
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [keysRes, modelsRes] = await Promise.all([
        supabase.from("api_keys").select("*").eq("is_global", true).order("created_at"),
        supabase.from("global_models").select("*").order("sort_order"),
      ]);

      if (isMountedRef.current) {
        setApiKeys((keysRes.data as ApiKey[]) ?? []);
        setModels((modelsRes.data as GlobalModel[]) ?? []);
        if (keysRes.data && keysRes.data.length > 0 && !selectedKeyId) {
          setSelectedKeyId(keysRes.data[0]?.id ?? null);
        }
      }
    } catch {
      // صامت
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [supabase, selectedKeyId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => { isMountedRef.current = false; };
  }, [fetchData]);

  const filteredModels = models.filter((m) => m.api_key_id === selectedKeyId);

  /**
   * إضافة نموذج يدوياً
   */
  const addModel = useCallback(async () => {
    if (!selectedKeyId || !newModelId.trim() || !newModelName.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("global_models").insert({
        api_key_id: selectedKeyId,
        model_id: newModelId.trim(),
        model_name: newModelName.trim(),
        sort_order: filteredModels.length,
        is_active: true,
      });
      if (!error) {
        setNewModelId("");
        setNewModelName("");
        setShowAddForm(false);
        await fetchData();
      }
    } catch {
      // صامت
    } finally {
      setIsSaving(false);
    }
  }, [selectedKeyId, newModelId, newModelName, filteredModels.length, supabase, fetchData]);

  /**
   * تبديل نشاط نموذج
   */
  const toggleModel = useCallback(async (id: string, current: boolean) => {
    try {
      await supabase.from("global_models").update({ is_active: !current }).eq("id", id);
      await fetchData();
    } catch {
      // صامت
    }
  }, [supabase, fetchData]);

  /**
   * حذف نموذج
   */
  const deleteModel = useCallback(async (id: string) => {
    try {
      await supabase.from("global_models").delete().eq("id", id);
      await fetchData();
    } catch {
      // صامت
    }
  }, [supabase, fetchData]);

  /**
   * جلب النماذج تلقائياً من المنصة
   */
  const autoFetchModels = useCallback(async () => {
    if (!selectedKeyId) return;
    setIsFetching(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKeyId: selectedKeyId }),
      });

      if (res.ok) {
        const data = await res.json();
        const fetchedModels = (data.models ?? []) as { id: string; name: string }[];

        for (let i = 0; i < fetchedModels.length; i++) {
          const model = fetchedModels[i];
          if (!model) continue;
          const exists = filteredModels.some((m) => m.model_id === model.id);
          if (!exists) {
            await supabase.from("global_models").insert({
              api_key_id: selectedKeyId,
              model_id: model.id,
              model_name: model.name,
              sort_order: filteredModels.length + i,
              is_active: true,
            });
          }
        }
        await fetchData();
      }
    } catch {
      // صامت
    } finally {
      setIsFetching(false);
    }
  }, [selectedKeyId, filteredModels, supabase, fetchData]);

  if (isLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        لا توجد مفاتيح API عامة. أضف مفاتيح من صفحة مفاتيح API أولاً.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* اختيار المفتاح */}
      <div className="flex flex-wrap gap-2">
        {apiKeys.map((key) => {
          const platform = SUPPORTED_PLATFORMS.find((p) => p.name === key.platform);
          return (
            <button
              key={key.id}
              onClick={() => setSelectedKeyId(key.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                selectedKeyId === key.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gray-300"
              )}
            >
              <span>{platform?.icon ?? "🔑"}</span>
              <span>{key.label}</span>
              <span className="text-[10px] bg-gray-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">
                {models.filter((m) => m.api_key_id === key.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* أزرار */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-xs font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("add_model")}
        </button>
        <button
          onClick={autoFetchModels}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-50"
        >
          {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {t("fetch_models")}
        </button>
      </div>

      {/* نموذج إضافة يدوي */}
      {showAddForm && (
        <div className="flex items-end gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-gray-500">{t("model_id")}</label>
            <input value={newModelId} onChange={(e) => setNewModelId(e.target.value)} placeholder="gpt-4o" dir="ltr" className="w-full px-3 py-2 rounded-lg border text-xs bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-gray-500">{t("model_name")}</label>
            <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="GPT-4o" className="w-full px-3 py-2 rounded-lg border text-xs bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border" />
          </div>
          <button onClick={addModel} disabled={isSaving} className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-50">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tCommon("save")}
          </button>
          <button onClick={() => setShowAddForm(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* قائمة النماذج */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden">
        {filteredModels.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">{tCommon("no_results")}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {filteredModels.map((model) => (
              <div key={model.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-hover/50">
                <GripVertical className="h-4 w-4 text-gray-300 cursor-grab flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{model.model_name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate" dir="ltr">{model.model_id}</p>
                </div>
                <button onClick={() => toggleModel(model.id, model.is_active)} className="flex-shrink-0">
                  {model.is_active
                    ? <ToggleRight className="h-5 w-5 text-green-500" />
                    : <ToggleLeft className="h-5 w-5 text-gray-400" />
                  }
                </button>
                <button onClick={() => deleteModel(model.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10 text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
