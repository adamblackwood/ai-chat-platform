// صفحة إدارة النماذج - إدارة النماذج العامة لكل مفتاح
"use client";

import { useTranslations } from "next-intl";

import ModelsManager from "@/components/admin/ModelsManager";

export default function AdminModelsPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        {t("models")}
      </h2>
      <ModelsManager />
    </div>
  );
}
