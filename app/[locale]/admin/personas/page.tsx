// صفحة إدارة الشخصيات - الشخصيات النظامية والمميزة
"use client";

import { useTranslations } from "next-intl";
import PersonasManager from "@/components/admin/PersonasManager";

export default function AdminPersonasPage() {
  const t = useTranslations("admin");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("personas")}</h2>
      <PersonasManager />
    </div>
  );
}
