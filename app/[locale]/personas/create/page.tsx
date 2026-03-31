// صفحة إنشاء شخصية جديدة - نموذج الإنشاء مع عداد الحد
"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import RouteGuard from "@/components/auth/RouteGuard";
import Sidebar from "@/components/sidebar/Sidebar";
import PersonaForm from "@/components/personas/PersonaForm";
import { usePersonas } from "@/hooks/usePersonas";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { FREE_MAX_PERSONAS } from "@/utils/constants";
import { cn } from "@/utils/cn";

/**
 * المحتوى الداخلي لصفحة إنشاء شخصية
 */
function CreatePersonaContent() {
  const t = useTranslations("personas");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const locale = useUIStore((s) => s.locale);
  const role = useAuthStore((s) => s.role);
  const { customCount, canCreateCustom } = usePersonas();

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${locale}/personas`)}
              aria-label={tCommon("back")}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-gray-500 rtl-flip" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("create_title")}
            </h1>
          </div>

          {/* عداد الشخصيات للمجاني */}
          {role === "free" && (
            <span
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full",
                canCreateCustom
                  ? "bg-primary/10 text-primary"
                  : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              )}
            >
              {t("persona_count", {
                count: customCount,
                max: FREE_MAX_PERSONAS,
              })}
            </span>
          )}
        </header>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {canCreateCustom ? (
              <PersonaForm />
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                  {t("at_limit_message")}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/personas`)}
                  className={cn(
                    "px-4 py-2 rounded-lg",
                    "bg-primary hover:bg-primary-600 text-white text-sm font-medium",
                    "transition-colors"
                  )}
                >
                  {tCommon("back")}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * صفحة إنشاء شخصية - محمية
 */
export default function CreatePersonaPage() {
  return (
    <RouteGuard>
      <CreatePersonaContent />
    </RouteGuard>
  );
}
