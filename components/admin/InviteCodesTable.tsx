// جدول رموز الدعوة - إنشاء ونسخ وتعطيل وحذف وعرض الاستخدامات
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Plus, Copy, Check, Trash2, ToggleLeft, ToggleRight,
  Loader2, X, Eye, Link2,
} from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { generateRandomCode, copyToClipboard } from "@/utils/helpers";
import { formatRelativeTime, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

import type { InviteCode, InviteCodeUse } from "@/types/invite-code";

export default function InviteCodesTable() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const supabase = getSupabaseBrowser();
  const user = useAuthStore((s) => s.user);
  const locale = useUIStore((s) => s.locale);

  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [usesView, setUsesView] = useState<string | null>(null);
  const [uses, setUses] = useState<InviteCodeUse[]>([]);

  // نموذج الإنشاء
  const [formCode, setFormCode] = useState("");
  const [formMaxUses, setFormMaxUses] = useState(1);
  const [formDuration, setFormDuration] = useState<number | null>(30);
  const [formExpiry, setFormExpiry] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isMountedRef = useRef(true);

  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
      if (isMountedRef.current) setCodes((data as InviteCode[]) ?? []);
    } catch { /* silent */ }
    finally { if (isMountedRef.current) setIsLoading(false); }
  }, [supabase]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCodes();
    return () => { isMountedRef.current = false; };
  }, [fetchCodes]);

  const createCode = useCallback(async () => {
    if (!user || !formCode.trim()) return;
    setIsSaving(true);
    try {
      await supabase.from("invite_codes").insert({
        code: formCode.trim(),
        created_by: user.id,
        max_uses: formMaxUses,
        premium_duration_days: formDuration,
        expires_at: formExpiry ? new Date(formExpiry).toISOString() : null,
        is_active: true,
      });
      setShowForm(false);
      setFormCode("");
      setFormMaxUses(1);
      setFormDuration(30);
      setFormExpiry("");
      await fetchCodes();
    } catch { /* silent */ }
    finally { setIsSaving(false); }
  }, [user, formCode, formMaxUses, formDuration, formExpiry, supabase, fetchCodes]);

  const toggleActive = useCallback(async (id: string, current: boolean) => {
    try {
      await supabase.from("invite_codes").update({ is_active: !current }).eq("id", id);
      await fetchCodes();
    } catch { /* silent */ }
  }, [supabase, fetchCodes]);

  const deleteCode = useCallback(async (id: string) => {
    try {
      await supabase.from("invite_codes").delete().eq("id", id);
      setDeleteTarget(null);
      await fetchCodes();
    } catch { /* silent */ }
  }, [supabase, fetchCodes]);

  const handleCopy = useCallback(async (code: string, id: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const link = `${appUrl}/${locale}/invite/${code}`;
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, [locale]);

  const viewUses = useCallback(async (codeId: string) => {
    setUsesView(codeId);
    try {
      const { data } = await supabase.from("invite_code_uses").select("*").eq("invite_code_id", codeId).order("used_at", { ascending: false });
      setUses((data as InviteCodeUse[]) ?? []);
    } catch { setUses([]); }
  }, [supabase]);

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowForm(true); setFormCode(generateRandomCode(8)); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> {t("create_invite")}
        </button>
      </div>

      {/* نموذج الإنشاء */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t("create_invite")}</h4>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">{t("code_label")}</label>
              <div className="flex gap-2">
                <input value={formCode} onChange={(e) => setFormCode(e.target.value)} dir="ltr"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm font-mono bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border" />
                <button onClick={() => setFormCode(generateRandomCode(8))} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-xs hover:bg-gray-50 dark:hover:bg-dark-hover">
                  {t("generate_code")}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">{t("max_uses")}</label>
              <input type="number" value={formMaxUses} onChange={(e) => setFormMaxUses(Math.max(1, parseInt(e.target.value) || 1))} min={1}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">{t("premium_duration")}</label>
              <div className="flex gap-1.5">
                {[30, 60, 90].map((d) => (
                  <button key={d} onClick={() => setFormDuration(d)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    formDuration === d ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400")}>{d}</button>
                ))}
                <button onClick={() => setFormDuration(null)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  formDuration === null ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400")}>{t("duration_permanent")}</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">{t("code_expiry")}</label>
              <input type="date" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border" />
            </div>
          </div>
          <button onClick={createCode} disabled={isSaving || !formCode.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {tCommon("create")}
          </button>
        </div>
      )}

      {/* الجدول */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-x-auto">
        {codes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{tCommon("no_results")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("code_label")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("max_uses")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("premium_duration")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{tCommon("active")}</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded">{c.code}</code>
                  </td>
                  <td className="py-3 px-4 text-xs">{c.current_uses}/{c.max_uses}</td>
                  <td className="py-3 px-4 text-xs">{c.premium_duration_days ? `${c.premium_duration_days} يوم` : tCommon("permanent")}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleActive(c.id, c.is_active)}>
                      {c.is_active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleCopy(c.code, c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500" aria-label="Copy link">
                        {copiedId === c.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Link2 className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => viewUses(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500" aria-label="View uses"><Eye className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteTarget(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* عرض الاستخدامات */}
      {usesView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setUsesView(null)} />
          <div className="relative w-full max-w-md mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("view_uses")}</h3>
              <button onClick={() => setUsesView(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            {uses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">{tCommon("no_results")}</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uses.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-surface text-xs">
                    <span className="text-gray-600 dark:text-gray-400 font-mono">{u.user_id.slice(0, 12)}...</span>
                    <span className="text-gray-400">{formatRelativeTime(u.used_at, "ar")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteCode(deleteTarget); }}
        title={t("delete_code")} variant="danger" />
    </div>
  );
}
