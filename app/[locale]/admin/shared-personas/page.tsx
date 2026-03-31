// صفحة الشخصيات المشتركة قيد المراجعة
"use client";

import { useTranslations } from "next-intl";
import SharedPersonasQueue from "@/components/admin/SharedPersonasQueue";

export default function AdminSharedPersonasPage() {
  const t = useTranslations("admin");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("shared_personas")}</h2>
      <SharedPersonasQueue />
    </div>
  );
}
