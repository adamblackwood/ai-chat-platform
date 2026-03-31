// جدول مفاتيح API العامة - عرض وإضافة وتعديل وحذف
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Key,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { SUPPORTED_PLATFORMS } from "@/utils/constants";
import { formatRelativeTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";

import type { ApiKey } from "@/types/api-key";

/**
 * جدول مفاتيح API العامة للإدارة
 */
export default function ApiKeysTable() {
  const t = useTranslations("admin");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // نموذج الإضافة
  const [formPlatform, setFormPlatform] = useState("openrouter");
  const [formKey, setFormKey] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isMountedRef = useRef(true);

  /**
   * جلب المفاتيح
   */
  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys");
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current) setKeys(data.keys ?? []);
      }
    } catch {
      // صامت
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchKeys();
    return () => { isMountedRef.current = false; };
  }, [fetchKeys]);

  /**
   * إضافة مفتاح
   */
  const addKey = useCallback(async () => {
    if (!formKey.trim() || !formLabel.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: formPlatform,
          key: formKey.trim(),
          label: formLabel.trim(),
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormKey("");
        setFormLabel("");
        await fetchKeys();
      }
    } catch {
      // صامت
    } finally {
      setIsSaving(false);
    }
  }, [formPlatform, formKey, formLabel, fetchKeys]);

  /**
   * تبديل حالة التفعيل
   */
  const toggleActive = useCallback(async (id: string, currentState: boolean) => {
    setActionLoading(id);
    try {
      await fetch("/api/admin/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentState }),
      });
      await fetchKeys();
    } catch {
      // صامت
    } finally {
      setActionLoading(null);
    }
  }, [fetchKeys]);

  /**
   * حذف مفتاح
   */
  const deleteKey = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await fetch("/api/admin/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchKeys();
    } catch {
      // صامت
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  }, [fetchKeys]);

  const platformIcon = (name: string) => {
    return SUPPORTED_PLATFORMS.find((p) => p.name === name)?.icon ?? "🔑";
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* زر إضافة */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("add_api_key")}
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showAddForm && (
        <div className={cn(
          "rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-4",
          "animate-fade-in"
        )}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t("add_api_key")}</h4>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={formPlatform}
              onChange={(e) => setFormPlatform(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border"
            >
              {SUPPORTED_PLATFORMS.map((p) => (
                <option key={p.name} value={p.name}>{p.icon} {p.displayName}</option>
              ))}
            </select>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder={tSettings("label_placeholder")}
              className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border"
            />
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder={tSettings("key_placeholder")}
                dir="ltr"
                className="w-full ps-3 pe-9 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Toggle key visibility"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <button
            onClick={addKey}
            disabled={isSaving || !formKey.trim() || !formLabel.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {tSettings("save_key")}
          </button>
        </div>
      )}

      {/* الجدول */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-x-auto">
        {keys.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{tCommon("no_results")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{tSettings("platform_label")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{tSettings("label_label")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_status")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_joined")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{platformIcon(key.platform)}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{key.platform}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{key.label}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(key.id, key.is_active)}
                      disabled={actionLoading === key.id}
                      className="transition-colors"
                    >
                      {key.is_active ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{formatRelativeTime(key.created_at, "ar")}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setDeleteTarget(key.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors"
                        aria-label="Delete key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteKey(deleteTarget); }}
        title={t("delete_key_admin")}
        description={tSettings("delete_key_confirm")}
        variant="danger"
      />
    </div>
  );
}
