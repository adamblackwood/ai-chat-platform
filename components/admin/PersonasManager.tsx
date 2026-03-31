// مدير الشخصيات - تبويبات نظامية ومميزة مع إضافة وتعديل وحذف
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Loader2, X, Save, RefreshCw } from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { PERSONA_CATEGORIES } from "@/utils/constants";
import { cn } from "@/utils/cn";

import type { Persona, PersonaCategory } from "@/types/persona";

const ORIGINAL_IDS = [
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "d4e5f6a7-b8c9-0123-defa-234567890123",
];

type TabKey = "system" | "premium";

export default function PersonasManager() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const supabase = getSupabaseBrowser();

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("system");
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrompt, setFormPrompt] = useState("");
  const [formCategory, setFormCategory] = useState<PersonaCategory>("general");
  const [formIcon, setFormIcon] = useState("🎯");

  const isMountedRef = useRef(true);

  const fetchPersonas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("personas")
        .select("*")
        .in("type", ["system", "premium"])
        .order("created_at", { ascending: true });
      if (isMountedRef.current) setPersonas((data as Persona[]) ?? []);
    } catch { /* silent */ }
    finally { if (isMountedRef.current) setIsLoading(false); }
  }, [supabase]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchPersonas();
    return () => { isMountedRef.current = false; };
  }, [fetchPersonas]);

  const filtered = personas.filter((p) => p.type === activeTab);
  const isOriginal = (id: string) => ORIGINAL_IDS.includes(id);

  const openForm = (persona?: Persona) => {
    if (persona) {
      setEditingPersona(persona);
      setFormName(persona.name);
      setFormDesc(persona.description);
      setFormPrompt(persona.system_prompt);
      setFormCategory(persona.category as PersonaCategory);
      setFormIcon(persona.icon_url ?? "🎯");
    } else {
      setEditingPersona(null);
      setFormName("");
      setFormDesc("");
      setFormPrompt("");
      setFormCategory("general");
      setFormIcon("🎯");
    }
    setShowForm(true);
  };

  const savePersona = async () => {
    if (!formName.trim() || !formPrompt.trim()) return;
    setIsSaving(true);
    try {
      if (editingPersona) {
        await supabase.from("personas").update({
          name: formName.trim(), description: formDesc.trim(),
          system_prompt: formPrompt.trim(), category: formCategory,
          icon_url: formIcon, updated_at: new Date().toISOString(),
        }).eq("id", editingPersona.id);
      } else {
        await supabase.from("personas").insert({
          name: formName.trim(), description: formDesc.trim(),
          system_prompt: formPrompt.trim(), category: formCategory,
          icon_url: formIcon, type: activeTab, is_active: true, is_approved: true,
        });
      }
      setShowForm(false);
      await fetchPersonas();
    } catch { /* silent */ }
    finally { setIsSaving(false); }
  };

  const deletePersona = async () => {
    if (!deleteTarget || isOriginal(deleteTarget.id)) return;
    try {
      await supabase.from("personas").delete().eq("id", deleteTarget.id);
      setDeleteTarget(null);
      await fetchPersonas();
    } catch { /* silent */ }
  };

  const convertToSystem = async (id: string) => {
    try {
      await supabase.from("personas").update({ type: "system", updated_at: new Date().toISOString() }).eq("id", id);
      await fetchPersonas();
    } catch { /* silent */ }
  };

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      {/* التبويبات */}
      <div className="flex items-center gap-2">
        {(["system", "premium"] as TabKey[]).map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab ? "bg-primary text-white" : "bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover"
            )}>
            {tab === "system" ? t("add_system_persona").replace("إضافة ", "") : t("add_premium_persona").replace("إضافة ", "")}
            <span className="ms-1.5 text-xs opacity-70">({personas.filter((p) => p.type === tab).length})</span>
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => openForm()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          {activeTab === "system" ? t("add_system_persona") : t("add_premium_persona")}
        </button>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {editingPersona ? t("edit_persona") : activeTab === "system" ? t("add_system_persona") : t("add_premium_persona")}
            </h4>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="اسم الشخصية" maxLength={100}
              className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border focus:ring-2 focus:ring-primary/50 focus:outline-none" />
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as PersonaCategory)}
              className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border">
              {PERSONA_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.labelAr}</option>)}
            </select>
          </div>
          <input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="🎯" maxLength={4}
            className="w-20 px-3 py-2 rounded-lg border text-center text-lg bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border" />
          <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="الوصف" rows={2}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border resize-none" />
          <textarea value={formPrompt} onChange={(e) => setFormPrompt(e.target.value)} placeholder="System Prompt" rows={6}
            className="w-full px-3 py-2 rounded-lg border text-xs font-mono bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border resize-y" />
          <button onClick={savePersona} disabled={isSaving || !formName.trim() || !formPrompt.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {tCommon("save")}
          </button>
        </div>
      )}

      {/* الجدول */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{tCommon("no_results")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">الشخصية</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">التصنيف</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">الاستخدام</th>
                <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon_url ?? "🎭"}</span>
                      <div><p className="text-xs font-medium text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{p.description}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{PERSONA_CATEGORIES.find((c) => c.value === p.category)?.labelAr ?? p.category}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">{p.usage_count}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openForm(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      {activeTab === "premium" && (
                        <button onClick={() => convertToSystem(p.id)} title={t("convert_to_system")}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 text-blue-500" aria-label="Convert">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isOriginal(p.id) ? (
                        <span className="text-[10px] text-gray-400 px-2">🔒</span>
                      ) : (
                        <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={deletePersona}
        title={t("delete_persona")} description={deleteTarget && isOriginal(deleteTarget.id) ? t("cannot_delete_original") : undefined} variant="danger" />
    </div>
  );
}
