// مكتبة الشخصيات - 4 تبويبات مع بحث وتصفية وشبكة متجاوبة
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";

import PersonaCard from "@/components/personas/PersonaCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { usePersonas } from "@/hooks/usePersonas";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { PERSONA_CATEGORIES } from "@/utils/constants";
import { debounce } from "@/utils/helpers";
import { cn } from "@/utils/cn";

import type { PersonaCategory } from "@/types/persona";

/**
 * التبويبات
 */
type TabKey = "basic" | "premium" | "custom" | "community";

/**
 * مكتبة الشخصيات مع التبويبات
 */
export default function PersonaLibrary() {
  const t = useTranslations("personas");
  const router = useRouter();
  const locale = useUIStore((s) => s.locale);
  const role = useAuthStore((s) => s.role);
  const {
    systemPersonas,
    premiumPersonas,
    customPersonas,
    communityPersonas,
    isLoading,
    canCreateCustom,
  } = usePersonas();

  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PersonaCategory | "all">("all");

  const debouncedSetQuery = useMemo(
    () => debounce((q: string) => setDebouncedQuery(q), 300),
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSetQuery(value);
    },
    [debouncedSetQuery]
  );

  /**
   * الشخصيات حسب التبويب النشط
   */
  const currentPersonas = useMemo(() => {
    switch (activeTab) {
      case "basic":
        return systemPersonas;
      case "premium":
        return premiumPersonas;
      case "custom":
        return customPersonas;
      case "community":
        return communityPersonas;
      default:
        return [];
    }
  }, [activeTab, systemPersonas, premiumPersonas, customPersonas, communityPersonas]);

  /**
   * تصفية حسب البحث والتصنيف
   */
  const filteredPersonas = useMemo(() => {
    let filtered = currentPersonas;

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    return filtered;
  }, [currentPersonas, debouncedQuery, categoryFilter]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "basic", label: t("tab_basic"), count: systemPersonas.length },
    { key: "premium", label: t("tab_premium"), count: premiumPersonas.length },
    { key: "custom", label: t("tab_custom"), count: customPersonas.length },
    { key: "community", label: t("tab_community"), count: communityPersonas.length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* التبويبات */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-dark-surface overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCategoryFilter("all");
            }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
              "transition-all duration-200",
              activeTab === tab.key
                ? "bg-white dark:bg-dark-card text-primary shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-200 dark:bg-dark-border text-gray-500"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* البحث + التصفية + إنشاء */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* البحث */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={`${t("library_title")}...`}
            className={cn(
              "w-full ps-9 pe-3 py-2.5 rounded-lg border text-sm",
              "bg-white dark:bg-dark-input",
              "border-gray-300 dark:border-dark-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            )}
          />
        </div>

        {/* فلتر التصنيف */}
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as PersonaCategory | "all")
          }
          className={cn(
            "px-3 py-2.5 rounded-lg border text-sm",
            "bg-white dark:bg-dark-input",
            "border-gray-300 dark:border-dark-border",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          <option value="all">{t("select_category")}</option>
          {PERSONA_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {locale === "ar" ? cat.labelAr : cat.labelEn}
            </option>
          ))}
        </select>

        {/* زر إنشاء (في تبويب المخصصة) */}
        {activeTab === "custom" && (
          <button
            onClick={() => router.push(`/${locale}/personas/create`)}
            disabled={!canCreateCustom}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
              "bg-primary hover:bg-primary-600 text-white",
              "disabled:opacity-50 transition-colors whitespace-nowrap"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>{t("create_title")}</span>
          </button>
        )}
      </div>

      {/* شبكة الشخصيات */}
      {filteredPersonas.length === 0 ? (
        <EmptyState
          title={t("library_title")}
          description={searchQuery ? undefined : undefined}
          action={
            activeTab === "custom" && canCreateCustom ? (
              <button
                onClick={() => router.push(`/${locale}/personas/create`)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium transition-colors"
              >
                {t("create_title")}
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPersonas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      )}
    </div>
  );
}
