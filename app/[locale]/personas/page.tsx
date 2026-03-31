// صفحة مكتبة الشخصيات - عرض جميع الشخصيات مع البحث والتصفية
"use client";

import { useTranslations } from "next-intl";

import RouteGuard from "@/components/auth/RouteGuard";
import Sidebar from "@/components/sidebar/Sidebar";
import PersonaLibrary from "@/components/personas/PersonaLibrary";
import { cn } from "@/utils/cn";

/**
 * المحتوى الداخلي لصفحة الشخصيات
 */
function PersonasPageContent() {
  const t = useTranslations("personas");

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg dark:bg-dark-bg">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* الرأس */}
        <header
          className={cn(
            "flex items-center justify-between",
            "px-6 py-4",
            "border-b border-gray-200 dark:border-dark-border",
            "bg-white dark:bg-dark-card"
          )}
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("library_title")}
          </h1>
        </header>

        {/* المكتبة */}
        <div className="flex-1 overflow-y-auto">
          <PersonaLibrary />
        </div>
      </main>
    </div>
  );
}

/**
 * صفحة مكتبة الشخصيات - محمية
 */
export default function PersonasPage() {
  return (
    <RouteGuard>
      <PersonasPageContent />
    </RouteGuard>
  );
}
