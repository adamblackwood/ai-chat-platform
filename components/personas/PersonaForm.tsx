// نموذج إنشاء/تعديل شخصية - اسم ووصف وتصنيف وأيقونة وتعليمات مع معاينة
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Save, Share2, Eye, Loader2 } from "lucide-react";

import PersonaPreview from "@/components/personas/PersonaPreview";
import { usePersonas } from "@/hooks/usePersonas";
import { useUIStore } from "@/stores/uiStore";
import { isValidSystemPrompt } from "@/utils/validators";
import { PERSONA_CATEGORIES, MAX_SYSTEM_PROMPT_LENGTH } from "@/utils/constants";
import { cn } from "@/utils/cn";

import type { Persona, PersonaCategory, CreatePersonaData } from "@/types/persona";

/**
 * خصائص نموذج الشخصية
 */
interface PersonaFormProps {
  editPersona?: Persona;
}

const EMOJI_OPTIONS = [
  "🎯", "💡", "🧠", "⚡", "🔥", "💼", "📚", "✍️",
  "🤖", "🎨", "📊", "🌐", "💻", "📧", "🔬", "📢",
  "🎓", "🌍", "🏆", "🎭", "🧪", "📝", "🔮", "🛠️",
];

/**
 * نموذج إنشاء أو تعديل شخصية
 */
export default function PersonaForm({ editPersona }: PersonaFormProps) {
  const t = useTranslations("personas");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const locale = useUIStore((s) => s.locale);
  const { createPersona, updatePersona } = usePersonas();

  const [name, setName] = useState(editPersona?.name ?? "");
  const [description, setDescription] = useState(editPersona?.description ?? "");
  const [category, setCategory] = useState<PersonaCategory>(
    (editPersona?.category as PersonaCategory) ?? "general"
  );
  const [iconUrl, setIconUrl] = useState(editPersona?.icon_url ?? "🎯");
  const [systemPrompt, setSystemPrompt] = useState(editPersona?.system_prompt ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingShared, setIsSavingShared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isEditing = !!editPersona;
  const promptLength = systemPrompt.length;
  const isPromptValid = isValidSystemPrompt(systemPrompt);

  const isFormValid = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      name.trim().length <= 100 &&
      description.trim().length >= 5 &&
      isPromptValid
    );
  }, [name, description, isPromptValid]);

  /**
   * حفظ الشخصية
   */
  const handleSave = useCallback(
    async (share: boolean = false) => {
      if (!isFormValid) {
        setError(tCommon("required"));
        return;
      }

      const setter = share ? setIsSavingShared : setIsSaving;
      setter(true);
      setError(null);

      try {
        if (isEditing && editPersona) {
          const success = await updatePersona(editPersona.id, {
            name: name.trim(),
            description: description.trim(),
            system_prompt: systemPrompt.trim(),
            icon_url: iconUrl,
            category,
          });

          if (success) {
            router.push(`/${locale}/personas`);
          } else {
            setError(tCommon("error_occurred"));
          }
        } else {
          const data: CreatePersonaData = {
            name: name.trim(),
            description: description.trim(),
            system_prompt: systemPrompt.trim(),
            icon_url: iconUrl,
            category,
            type: share ? "shared" : "custom",
          };

          const result = await createPersona(data);
          if (result) {
            router.push(`/${locale}/personas`);
          } else {
            setError(tCommon("error_occurred"));
          }
        }
      } catch {
        setError(tCommon("error_occurred"));
      } finally {
        setter(false);
      }
    },
    [
      isFormValid, isEditing, editPersona, name, description,
      systemPrompt, iconUrl, category, createPersona, updatePersona,
      router, locale, tCommon,
    ]
  );

  return (
    <>
      <div className="space-y-6">
        {/* الاسم */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("name_label")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value.slice(0, 100));
              setError(null);
            }}
            placeholder={t("name_placeholder")}
            maxLength={100}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border text-sm",
              "bg-white dark:bg-dark-input",
              "border-gray-300 dark:border-dark-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            )}
          />
          <p className="text-xs text-gray-400 text-end">{name.length}/100</p>
        </div>

        {/* الوصف */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("description_label")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError(null);
            }}
            placeholder={t("description_placeholder")}
            rows={2}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border text-sm resize-none",
              "bg-white dark:bg-dark-input",
              "border-gray-300 dark:border-dark-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            )}
          />
        </div>

        {/* التصنيف */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("category_label")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PersonaCategory)}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border text-sm",
              "bg-white dark:bg-dark-input",
              "border-gray-300 dark:border-dark-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            )}
          >
            {PERSONA_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {locale === "ar" ? cat.labelAr : cat.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* الأيقونة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("icon_label")}
          </label>
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg border w-full",
                "bg-white dark:bg-dark-input",
                "border-gray-300 dark:border-dark-border",
                "hover:border-primary/30 transition-colors"
              )}
            >
              <span className="text-2xl">{iconUrl}</span>
              <span className="text-sm text-gray-500">{t("icon_label")}</span>
            </button>

            {showEmojiPicker && (
              <div
                className={cn(
                  "absolute top-full mt-2 z-20 p-3 rounded-xl shadow-xl",
                  "bg-white dark:bg-dark-card",
                  "border border-gray-200 dark:border-dark-border",
                  "grid grid-cols-8 gap-1",
                  "animate-fade-in"
                )}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setIconUrl(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={cn(
                      "h-9 w-9 rounded-lg text-xl",
                      "hover:bg-primary/10 transition-colors",
                      "flex items-center justify-center",
                      iconUrl === emoji && "bg-primary/20 ring-2 ring-primary"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* التعليمات (System Prompt) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("system_prompt_label")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => {
              setSystemPrompt(e.target.value.slice(0, MAX_SYSTEM_PROMPT_LENGTH));
              setError(null);
            }}
            placeholder={t("system_prompt_placeholder")}
            rows={8}
            maxLength={MAX_SYSTEM_PROMPT_LENGTH}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border text-sm resize-y min-h-[120px]",
              "bg-white dark:bg-dark-input",
              "border-gray-300 dark:border-dark-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "font-mono text-xs leading-relaxed"
            )}
          />
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-xs",
                promptLength < 10
                  ? "text-red-500"
                  : promptLength > MAX_SYSTEM_PROMPT_LENGTH * 0.9
                  ? "text-yellow-500"
                  : "text-gray-400"
              )}
            >
              {promptLength > 0 && !isPromptValid && "يجب 10 أحرف على الأقل"}
            </p>
            <p
              className={cn(
                "text-xs",
                promptLength > MAX_SYSTEM_PROMPT_LENGTH * 0.9
                  ? "text-yellow-500"
                  : "text-gray-400"
              )}
            >
              {promptLength}/{MAX_SYSTEM_PROMPT_LENGTH}
            </p>
          </div>
        </div>

        {/* الخطأ */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {/* الأزرار */}
        <div className="flex items-center gap-3">
          {/* معاينة */}
          <button
            onClick={() => setShowPreview(true)}
            disabled={!isFormValid}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
              "border border-gray-300 dark:border-dark-border",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-dark-hover",
              "disabled:opacity-50 transition-colors"
            )}
          >
            <Eye className="h-4 w-4" />
            <span>{t("preview")}</span>
          </button>

          <div className="flex-1" />

          {/* حفظ */}
          <button
            onClick={() => handleSave(false)}
            disabled={!isFormValid || isSaving}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
              "bg-primary hover:bg-primary-600 text-white",
              "disabled:opacity-50 transition-colors"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{t("save")}</span>
          </button>

          {/* حفظ ومشاركة */}
          {!isEditing && (
            <button
              onClick={() => handleSave(true)}
              disabled={!isFormValid || isSavingShared}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                "bg-gradient-to-r from-primary to-secondary text-white",
                "hover:opacity-90 disabled:opacity-50 transition-opacity"
              )}
            >
              {isSavingShared ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>{t("save_and_share")}</span>
            </button>
          )}
        </div>
      </div>

      {/* المعاينة */}
      {showPreview && (
        <PersonaPreview
          name={name}
          description={description}
          category={category}
          iconUrl={iconUrl}
          systemPrompt={systemPrompt}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            handleSave(false);
          }}
        />
      )}
    </>
  );
}
