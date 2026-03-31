// صفحة إعدادات النظام - تيليجرام والحدود
"use client";

import { useTranslations } from "next-intl";
import TelegramSettings from "@/components/admin/TelegramSettings";

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("system_settings")}</h2>
      <TelegramSettings />
    </div>
  );
}
