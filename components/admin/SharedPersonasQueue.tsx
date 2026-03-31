// طابور الشخصيات المشتركة - مراجعة الشخصيات المقدمة من المستخدمين
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Check, X, Eye, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { formatRelativeTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";

import type { Persona } from "@/types/persona";

export default function SharedPersonasQueue() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const supabase = getSupabaseBrowser();

  const [pending, setPending] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("personas")
        .select("*")
        .eq("type", "shared")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      if (isMountedRef.current) setPending((data as Persona[]) ?? []);
    } catch { /* silent */ }
    finally { if (isMountedRef.current) setIsLoading(false); }
  }, [supabase]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchPending();
    return () => { isMountedRef.current = false; };
  }, [fetchPending]);

  const approve = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await supabase.from("personas").update({ is_approved: true, updated_at: new Date().toISOString() }).eq("id", id);
      await fetchPending();
    } catch { /* silent */ }
    finally { setActionLoading(null); }
  }, [supabase, fetchPending]);

  const reject = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await supabase.from("personas").delete().eq("id", id);
      await fetchPending();
    } catch { /* silent */ }
    finally { setActionLoading(null); }
  }, [supabase, fetchPending]);

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  if (pending.length === 0) {
    return <EmptyState icon={<Check className="h-12 w-12" />} title={t("no_pending")} />;
  }

  return (
    <div className="space-y-3">
      {pending.map((p) => (
        <div key={p.id} className={cn("rounded-xl border bg-white dark:bg-dark-card p-4", "border-gray-200 dark:border-dark-border")}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{p.icon_url ?? "🎭"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">{t("pending_personas").split(" ")[0]}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{p.description}</p>
              <p className="text-[10px] text-gray-400">
                {p.user_id ? `المقدم: ${p.user_id.slice(0, 8)}...` : ""} • {formatRelativeTime(p.created_at, "ar")}
              </p>

              {/* عرض System Prompt */}
              <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary-600 transition-colors">
                <Eye className="h-3 w-3" />
                <span>{t("preview_persona")}</span>
                {expandedId === p.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {expandedId === p.id && (
                <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border animate-fade-in">
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{p.system_prompt}</p>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => approve(p.id)} disabled={actionLoading === p.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-200 disabled:opacity-50 transition-colors">
                {actionLoading === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} {t("approve")}
              </button>
              <button onClick={() => reject(p.id)} disabled={actionLoading === p.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors">
                <X className="h-3 w-3" /> {t("reject")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
